-- Guard public.finish_exam_attempt against a missing / not-owned / already-finished attempt.
-- Previously the UPDATE matched no rows, leaving result_row NULL, and the following INSERTs
-- raised "null value in column ... violates not-null constraint" instead of returning NULL.
create or replace function public.finish_exam_attempt(p_attempt_id uuid)
returns public.exam_attempts
language plpgsql
security invoker
set search_path = public
as $$
declare result_row public.exam_attempts;
begin
  update public.exam_attempts a set
    status = 'completed', finished_at = now(), updated_at = now(),
    total_points = coalesce((select sum(eq.points) from public.exam_questions eq where eq.exam_id = a.exam_id), 0),
    earned_points = coalesce((select sum(eq.points) from public.exam_questions eq join public.exam_answers ea on ea.question_id = eq.question_id and ea.attempt_id = a.id join public.questions q on q.id = eq.question_id where ea.answer <> '' and lower(trim(ea.answer)) = lower(trim(q.correct_answer))), 0),
    percentage = case when coalesce((select sum(eq.points) from public.exam_questions eq where eq.exam_id = a.exam_id), 0) = 0 then 0 else round(100.0 * coalesce((select sum(eq.points) from public.exam_questions eq join public.exam_answers ea on ea.question_id = eq.question_id and ea.attempt_id = a.id join public.questions q on q.id = eq.question_id where ea.answer <> '' and lower(trim(ea.answer)) = lower(trim(q.correct_answer))), 0) / (select sum(eq.points) from public.exam_questions eq where eq.exam_id = a.exam_id), 2) end
  where a.id = p_attempt_id and a.user_id = (select auth.uid()) and a.status = 'in_progress'
  returning a.* into result_row;

  if result_row.id is null then
    return null;
  end if;

  insert into public.user_answers (user_id, question_id, answer, is_correct, created_at)
  select result_row.user_id, ea.question_id, ea.answer, ea.answer <> '' and lower(trim(ea.answer)) = lower(trim(q.correct_answer)), now()
  from public.exam_answers ea join public.questions q on q.id = ea.question_id where ea.attempt_id = result_row.id;
  insert into public.mistakes (user_id, question_id, topic_id, user_answer, correct_answer, mistake_type, attempt_count)
  select result_row.user_id, ea.question_id, q.topic_id, ea.answer, q.correct_answer, 'exam', 1
  from public.exam_answers ea join public.questions q on q.id = ea.question_id
  where ea.attempt_id = result_row.id and (ea.answer = '' or lower(trim(ea.answer)) <> lower(trim(q.correct_answer)))
  on conflict (user_id, question_id) do update set attempt_count = public.mistakes.attempt_count + 1, user_answer = excluded.user_answer, last_seen_at = now();
  insert into public.study_sessions (user_id, session_type, started_at, finished_at, duration_seconds, questions_count, correct_count, xp_earned)
  values (result_row.user_id, 'exam', result_row.started_at, result_row.finished_at, greatest(0, extract(epoch from (result_row.finished_at - result_row.started_at))::int), (select count(*) from public.exam_questions where exam_id = result_row.exam_id), (select count(*) from public.exam_answers ea join public.questions q on q.id = ea.question_id where ea.attempt_id = result_row.id and ea.answer <> '' and lower(trim(ea.answer)) = lower(trim(q.correct_answer))), result_row.earned_points);
  return result_row;
end;
$$;
revoke all on function public.finish_exam_attempt(uuid) from public;
grant execute on function public.finish_exam_attempt(uuid) to authenticated;
