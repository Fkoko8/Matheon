-- Faza 3 — egzaminy z punktacją cząstkową.
--
-- Do tej pory `finish_exam_attempt` porównywał odpowiedź tekstowo z `correct_answer`,
-- więc zadania otwarte (dowody, uzasadnienia) zawsze dawały 0 punktów, a zapis liczby
-- w innej, poprawnej postaci (np. `4,0` vs `4`) potrafił odebrać punkt.
--
-- Teraz każda odpowiedź ma własną punktację:
--   * `points_earned` — punkty przyznane (auto lub po samoocenie wg matrycy),
--   * `graded_by`     — kto przyznał punkty ('auto' | 'self' | 'manual'),
--   * `is_correct`    — czy odpowiedź uznano za poprawną.
--
-- Silnik SQL nadal sprawdza odpowiedzi, które da się sprawdzić automatycznie
-- (zgodność po normalizacji białych znaków oraz porównanie liczbowe z tolerancją),
-- a w pozostałych przypadkach respektuje punktację zapisaną przez aplikację —
-- ograniczoną do liczby punktów za zadanie.
--
-- Dodatkowo zakończenie egzaminu zasila model umiejętności: dla każdego zadania
-- powstają zdarzenia `learning_events` per umiejętność, więc egzamin wpływa na
-- mastery i harmonogram powtórek SM-2 tak samo jak trening.

alter table public.exam_answers add column if not exists points_earned numeric(5,2) not null default 0;
alter table public.exam_answers add column if not exists graded_by text not null default 'auto';
alter table public.exam_answers add column if not exists is_correct boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'exam_answers_graded_by_check') then
    alter table public.exam_answers
      add constraint exam_answers_graded_by_check check (graded_by in ('auto', 'self', 'manual'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'exam_answers_points_check') then
    alter table public.exam_answers
      add constraint exam_answers_points_check check (points_earned >= 0);
  end if;
end $$;

create index if not exists exam_answers_attempt_points_idx on public.exam_answers(attempt_id, question_id);

create or replace function public.exam_answer_points(p_answer text, p_correct text, p_max_points numeric, p_points_earned numeric)
returns numeric
language sql
immutable
as $$
  with normalized as (
    select
      nullif(lower(regexp_replace(btrim(coalesce(p_answer, '')), '\s+', '', 'g')), '') as a,
      nullif(lower(regexp_replace(btrim(coalesce(p_correct, '')), '\s+', '', 'g')), '') as c
  )
  select case
    when (select a from normalized) is null then 0
    when (select a from normalized) = (select c from normalized) then p_max_points
    when p_answer ~ '^[+-]?[0-9]+([.,][0-9]+)?$' and p_correct ~ '^[+-]?[0-9]+([.,][0-9]+)?$'
      and abs(replace(p_answer, ',', '.')::numeric - replace(p_correct, ',', '.')::numeric) <= 1e-9
      then p_max_points
    else least(greatest(coalesce(p_points_earned, 0), 0), p_max_points)
  end;
$$;

create or replace function public.finish_exam_attempt(p_attempt_id uuid)
returns public.exam_attempts
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
    return null;
  end if;

  -- 2. Historia odpowiedzi (z punktacją per zadanie).
  insert into public.user_answers (user_id, question_id, answer, is_correct, created_at)
  select result_row.user_id, ea.question_id, ea.answer, ea.is_correct, now()
  from public.exam_answers ea
  where ea.attempt_id = result_row.id;

  -- 3. Pętla błędów: zadania bez pełnej punktacji wracają jako błędy do naprawy.
  insert into public.mistakes (user_id, question_id, topic_id, user_answer, correct_answer, mistake_type, attempt_count)
  select result_row.user_id, ea.question_id, q.topic_id, ea.answer, q.correct_answer, 'exam', 1
  from public.exam_answers ea
  join public.questions q on q.id = ea.question_id
  where ea.attempt_id = result_row.id and not ea.is_correct
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

  return result_row;
end;
$$;
revoke all on function public.finish_exam_attempt(uuid) from public;
grant execute on function public.finish_exam_attempt(uuid) to authenticated;

-- Ponowne przeliczenie próby po samoocenie zadań otwartych w raporcie.
-- Uczeń ocenia dowód wg matrycy, a ten RPC przelicza sumę i procent.
create or replace function public.regrade_exam_attempt(p_attempt_id uuid)
returns public.exam_attempts
language plpgsql
security invoker
set search_path = public
as $$
declare
  result_row public.exam_attempts;
  earned numeric;
  total numeric;
begin
  if not exists (
    select 1 from public.exam_attempts a
    where a.id = p_attempt_id and a.user_id = (select auth.uid()) and a.status = 'completed'
  ) then
    return null;
  end if;

  select
    coalesce(sum(eq.points), 0),
    coalesce(sum(least(greatest(ea.points_earned, 0), eq.points)), 0)
  into total, earned
  from public.exam_questions eq
  join public.exam_attempts at on at.exam_id = eq.exam_id and at.id = p_attempt_id
  left join public.exam_answers ea on ea.question_id = eq.question_id and ea.attempt_id = p_attempt_id
  where true;

  update public.exam_attempts a set
    total_points = total::int,
    earned_points = round(earned)::int,
    percentage = case when total = 0 then 0 else round(100.0 * earned / total, 2) end,
    updated_at = now()
  where a.id = p_attempt_id
  returning a.* into result_row;

  return result_row;
end;
$$;
revoke all on function public.regrade_exam_attempt(uuid) from public;
grant execute on function public.regrade_exam_attempt(uuid) to authenticated;
