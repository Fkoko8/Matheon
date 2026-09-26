-- Poprawki do `finish_exam_attempt` po teście `pnpm qa:examreport` na migracji 009.
--
-- 1. Pętla błędów obejmuje też zadania pozostawione bez odpowiedzi.
--    Migracja 009 przenosiła do `mistakes` wyłącznie wiersze z odpowiedziami
--    (`not ea.is_correct`), więc zadanie, którego uczeń nie wpisał w ogóle,
--    omijało pętlę naprawczą. Migracja 008 traktowała puste odpowiedzi jako błędy —
--    przywracamy to zachowanie na nowej punktacji cząstkowej.
--
-- 2. Ponowne zakończenie próby zwraca literalny JSON `null`.
--    Przy `returns exam_attempts` PostgREST serializuje kompozyt NULL jako
--    obiekt wypełniony nullami (`{"id":null,...}`), przez co ochrona
--    `if (!data) throw new Error('Ta próba została już zakończona.')`
--    w `lib/exams.ts` nigdy nie działała. Typ `json` z jawnym `json_build_object`
--    zachowuje identyczny kształt payloadu dla sukcesu, a `null` wychodzi
--    jako prawdziwy JSON null.

create or replace function public.finish_exam_attempt(p_attempt_id uuid)
returns json
language plpgsql
security invoker
set search_path = public
as $$
declare
  result_row public.exam_attempts;
  earned numeric;
  total numeric;
begin
  -- 1. Domknij automatyczną punktację: dla każdej odpowiedzi policz punkty
  --    (pełne za zgodność, inaczej punkty zapisane przez aplikację, max = punkty zadania).
  update public.exam_answers ea set
    points_earned = public.exam_answer_points(ea.answer, q.correct_answer, eq.points, ea.points_earned),
    is_correct = public.exam_answer_points(ea.answer, q.correct_answer, eq.points, ea.points_earned) >= eq.points,
    graded_by = case
      when public.exam_answer_points(ea.answer, q.correct_answer, eq.points, ea.points_earned) >= eq.points then 'auto'
      else ea.graded_by
    end
  from public.questions q, public.exam_questions eq, public.exam_attempts att
  where ea.question_id = q.id
    and eq.question_id = q.id
    and eq.exam_id = att.exam_id
    and att.id = ea.attempt_id
    and ea.attempt_id = p_attempt_id;

  select
    coalesce(sum(eq.points), 0),
    coalesce(sum(public.exam_answer_points(ea.answer, q.correct_answer, eq.points, ea.points_earned)), 0)
  into total, earned
  from public.exam_questions eq
  join public.exam_attempts att on att.exam_id = eq.exam_id and att.id = p_attempt_id
  left join public.exam_answers ea on ea.question_id = eq.question_id and ea.attempt_id = p_attempt_id
  left join public.questions q on q.id = eq.question_id;

  update public.exam_attempts a set
    status = 'completed',
    finished_at = now(),
    updated_at = now(),
    total_points = total::int,
    earned_points = round(earned)::int,
    percentage = case when total = 0 then 0 else round(100.0 * earned / total, 2) end
  where a.id = p_attempt_id and a.user_id = (select auth.uid()) and a.status = 'in_progress'
  returning a.* into result_row;

  if result_row.id is null then
    -- json null → PostgREST zwraca literalne `null`, nie obiekt z nullami.
    return null;
  end if;

  -- 2. Historia odpowiedzi (z punktacją per zadanie).
  insert into public.user_answers (user_id, question_id, answer, is_correct, created_at)
  select result_row.user_id, ea.question_id, ea.answer, ea.is_correct, now()
  from public.exam_answers ea
  where ea.attempt_id = result_row.id;

  -- 3. Pętla błędów: bez pełnej punktacji — także zadania bez żadnej odpowiedzi.
  insert into public.mistakes (user_id, question_id, topic_id, user_answer, correct_answer, mistake_type, attempt_count)
  select result_row.user_id, eq.question_id, q.topic_id,
         coalesce(ea.answer, ''), q.correct_answer, 'exam', 1
  from public.exam_questions eq
  join public.questions q on q.id = eq.question_id
  left join public.exam_answers ea on ea.question_id = eq.question_id and ea.attempt_id = result_row.id
  where eq.exam_id = result_row.exam_id
    and coalesce(ea.is_correct, false) = false
  on conflict (user_id, question_id) do update
    set attempt_count = public.mistakes.attempt_count + 1,
        user_answer = excluded.user_answer,
        last_seen_at = now(),
        resolved = false;

  -- 4. Sesja nauki.
  insert into public.study_sessions (user_id, session_type, started_at, finished_at, duration_seconds, questions_count, correct_count, xp_earned)
  values (
    result_row.user_id, 'exam', result_row.started_at, result_row.finished_at,
    greatest(0, extract(epoch from (result_row.finished_at - result_row.started_at))::int),
    (select count(*) from public.exam_questions where exam_id = result_row.exam_id),
    (select count(*) from public.exam_answers where attempt_id = result_row.id and is_correct),
    result_row.earned_points
  );

  -- 5. Mastery umiejętności: egzamin liczy się tak samo jak trening.
  insert into public.learning_events (user_id, event_type, skill_id, question_id, metadata)
  select
    result_row.user_id,
    'answer',
    qs.skill_id,
    ea.question_id,
    jsonb_build_object(
      'isCorrect', ea.is_correct,
      'hintsUsed', 0,
      'solutionViewed', false,
      'timeSeconds', 0,
      'grade', case when ea.is_correct then 4 else 1 end,
      'source', 'exam',
      'attemptId', result_row.id
    )
  from public.exam_answers ea
  join public.question_skills qs on qs.question_id = ea.question_id
  where ea.attempt_id = result_row.id
    and qs.skill_id is not null;

  return json_build_object(
    'id', result_row.id,
    'user_id', result_row.user_id,
    'exam_id', result_row.exam_id,
    'started_at', result_row.started_at,
    'finished_at', result_row.finished_at,
    'time_remaining_seconds', result_row.time_remaining_seconds,
    'status', result_row.status,
    'total_points', result_row.total_points,
    'earned_points', result_row.earned_points,
    'percentage', result_row.percentage,
    'created_at', result_row.created_at,
    'updated_at', result_row.updated_at
  );
end;
$$;
revoke all on function public.finish_exam_attempt(uuid) from public;
grant execute on function public.finish_exam_attempt(uuid) to authenticated;
