create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  time_remaining_seconds integer not null,
  status text not null default 'in_progress' check (status in ('not_started','in_progress','completed','abandoned')),
  total_points integer not null default 0,
  earned_points integer not null default 0,
  percentage numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  answer text not null default '',
  flagged boolean not null default false,
  saved_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);
create index if not exists exam_attempts_user_exam_idx on public.exam_attempts(user_id, exam_id, created_at desc);
create index if not exists exam_answers_attempt_idx on public.exam_answers(attempt_id);
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;
drop policy if exists "Users manage own exam attempts" on public.exam_attempts;
create policy "Users manage own exam attempts" on public.exam_attempts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own exam answers" on public.exam_answers;
create policy "Users manage own exam answers" on public.exam_answers for all to authenticated using (exists (select 1 from public.exam_attempts a where a.id = attempt_id and a.user_id = (select auth.uid()))) with check (exists (select 1 from public.exam_attempts a where a.id = attempt_id and a.user_id = (select auth.uid())));

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

insert into public.exams (title, year, level, duration_minutes, total_points, description, source, published)
select 'Matura rozszerzona 2026', 2026, 'extended', 180, 50, 'Autorski arkusz treningowy MATHEON.', 'MATHEON', true
where not exists (select 1 from public.exams where year = 2026 and level = 'extended');
insert into public.exams (title, year, level, duration_minutes, total_points, description, source, published)
select 'Matura podstawowa 2025', 2025, 'basic', 180, 46, 'Autorski arkusz treningowy MATHEON.', 'MATHEON', true
where not exists (select 1 from public.exams where year = 2025 and level = 'basic');

insert into public.exam_questions (exam_id, question_id, question_number, points, order_index)
select e.id, q.id, row_number() over (partition by e.id order by q.created_at)::int, q.points, row_number() over (partition by e.id order by q.created_at)::int
from public.exams e cross join lateral (select * from public.questions where published = true and level = e.level order by created_at limit 15) q
where e.source = 'MATHEON' and not exists (select 1 from public.exam_questions x where x.exam_id = e.id);
