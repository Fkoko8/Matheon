-- Create extensions
create extension if not exists pgcrypto;

-- Create custom types
create type public.content_level as enum ('basic','extended');
create type public.question_kind as enum ('numeric','text','single_choice','multiple_choice','open','proof');
create type public.session_kind as enum ('lesson','training','review','exam','ai');
create type public.activity_kind as enum ('lesson','training','review','exam','ai');
create type public.item_status as enum ('pending','completed','skipped');
create type public.message_role as enum ('user','assistant','system');

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  preferred_level public.content_level default 'basic',
  daily_goal_minutes integer not null default 30 check (daily_goal_minutes > 0),
  streak integer not null default 0 check (streak >= 0),
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subjects table
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  level public.content_level not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Topics table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  parent_id uuid references public.topics(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique(subject_id,slug)
);

-- Subtopics table
create table if not exists public.subtopics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique(topic_id,slug)
);

-- Lessons table
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  subtopic_id uuid references public.subtopics(id) on delete set null,
  title text not null,
  slug text not null unique,
  content text not null default '',
  difficulty integer not null default 1 check (difficulty between 1 and 5),
  estimated_minutes integer not null default 15 check (estimated_minutes > 0),
  order_index integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Questions table
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  subtopic_id uuid references public.subtopics(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  question_text text not null,
  question_type public.question_kind not null,
  level public.content_level not null,
  difficulty integer not null default 1 check (difficulty between 1 and 5),
  points integer not null default 1 check (points > 0),
  estimated_minutes integer not null default 5 check (estimated_minutes > 0),
  correct_answer text not null,
  solution_text text,
  source_type text,
  source_name text,
  source_year integer,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Hints table
create table if not exists public.hints (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  hint_level integer not null check (hint_level between 1 and 4),
  content text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique(question_id,hint_level)
);

-- Solutions table
create table if not exists public.solutions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.questions(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exams table
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year integer not null,
  level public.content_level not null,
  duration_minutes integer not null,
  total_points integer not null,
  description text,
  source text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Exam questions table
create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  question_number integer not null,
  points integer not null default 1,
  order_index integer not null default 0,
  unique(exam_id,question_id),
  unique(exam_id,question_number)
);

-- User progress table
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  subtopic_id uuid references public.subtopics(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  mastery numeric(5,2) not null default 0 check (mastery between 0 and 100),
  accuracy numeric(5,2) not null default 0 check (accuracy between 0 and 100),
  attempts integer not null default 0,
  correct_attempts integer not null default 0,
  incorrect_attempts integer not null default 0,
  hints_used integer not null default 0,
  solutions_viewed integer not null default 0,
  average_time_seconds integer not null default 0,
  last_attempt_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(topic_id,subtopic_id,lesson_id)=1),
  unique(user_id,topic_id),
  unique(user_id,subtopic_id),
  unique(user_id,lesson_id)
);

-- User answers table
create table if not exists public.user_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  answer text not null,
  is_correct boolean not null,
  is_partial boolean not null default false,
  time_seconds integer not null default 0,
  hints_used integer not null default 0,
  solution_viewed boolean not null default false,
  attempt_number integer not null default 1,
  created_at timestamptz not null default now()
);

-- Mistakes table
create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  subtopic_id uuid references public.subtopics(id) on delete set null,
  mistake_type text,
  user_answer text not null,
  correct_answer text not null,
  explanation text,
  resolved boolean not null default false,
  attempt_count integer not null default 1,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id,question_id)
);

-- Study sessions table
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_type public.session_kind not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_seconds integer not null default 0,
  questions_count integer not null default 0,
  correct_count integer not null default 0,
  xp_earned integer not null default 0,
  created_at timestamptz not null default now()
);

-- Study plans table
create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  target_level public.content_level,
  daily_goal_minutes integer not null default 30,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Study plan items table
create table if not exists public.study_plan_items (
  id uuid primary key default gen_random_uuid(),
  study_plan_id uuid not null references public.study_plans(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  question_count integer,
  scheduled_date date not null,
  scheduled_minutes integer not null default 15,
  activity_type public.activity_kind not null,
  status public.item_status not null default 'pending',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  check (lesson_id is not null or topic_id is not null)
);

-- AI conversations table
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  context_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- AI messages table
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role public.message_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- Achievements table
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text,
  xp_reward integer not null default 0,
  condition_type text not null,
  condition_value integer not null default 0,
  created_at timestamptz not null default now()
);

-- User achievements table
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(user_id,achievement_id)
);

-- Create indexes
create index if not exists topics_subject_idx on public.topics(subject_id,order_index);
create index if not exists topics_parent_idx on public.topics(parent_id);
create index if not exists subtopics_topic_idx on public.subtopics(topic_id,order_index);
create index if not exists lessons_topic_idx on public.lessons(topic_id,order_index);
create index if not exists lessons_subtopic_idx on public.lessons(subtopic_id);
create index if not exists questions_topic_idx on public.questions(topic_id);
create index if not exists questions_lesson_idx on public.questions(lesson_id);
create index if not exists hints_question_idx on public.hints(question_id,order_index);
create index if not exists exam_questions_exam_idx on public.exam_questions(exam_id,order_index);
create index if not exists answers_user_created_idx on public.user_answers(user_id,created_at desc);
create index if not exists answers_question_idx on public.user_answers(question_id);
create index if not exists progress_review_idx on public.user_progress(user_id,next_review_at);
create index if not exists mistakes_user_idx on public.mistakes(user_id,resolved,last_seen_at desc);
create index if not exists sessions_user_idx on public.study_sessions(user_id,created_at desc);
create index if not exists plan_items_date_idx on public.study_plan_items(scheduled_date,status);
create index if not exists conversations_user_idx on public.ai_conversations(user_id,updated_at desc);
create index if not exists messages_conversation_idx on public.ai_messages(conversation_id,created_at);
create index if not exists user_achievements_idx on public.user_achievements(user_id,earned_at desc);

-- Create trigger function for new user profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id,display_name)
  values (new.id,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.subtopics enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.hints enable row level security;
alter table public.solutions enable row level security;
alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_answers enable row level security;
alter table public.mistakes enable row level security;
alter table public.study_sessions enable row level security;
alter table public.study_plans enable row level security;
alter table public.study_plan_items enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- Create RLS policies

-- Profiles: users can only access their own
create policy profiles_own on public.profiles
for all to authenticated
using ((select auth.uid())=id)
with check ((select auth.uid())=id);

-- Educational content is readable by authenticated users
create policy subjects_read on public.subjects for select to authenticated using (true);
create policy topics_read on public.topics for select to authenticated using (true);
create policy subtopics_read on public.subtopics for select to authenticated using (true);
create policy lessons_read on public.lessons for select to authenticated using (published);
create policy questions_read on public.questions for select to authenticated using (published);
create policy hints_read on public.hints for select to authenticated using (exists(select 1 from public.questions q where q.id=question_id and q.published));
create policy solutions_read on public.solutions for select to authenticated using (exists(select 1 from public.questions q where q.id=question_id and q.published));
create policy exams_read on public.exams for select to authenticated using (published);
create policy exam_questions_read on public.exam_questions for select to authenticated using (exists(select 1 from public.exams e where e.id=exam_id and e.published));

-- User-owned data: users can only access their own
create policy progress_own on public.user_progress
for all to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);

create policy answers_own on public.user_answers
for all to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);

create policy mistakes_own on public.mistakes
for all to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);

create policy sessions_own on public.study_sessions
for all to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);

create policy plans_own on public.study_plans
for all to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);

create policy plan_items_own on public.study_plan_items
for all to authenticated
using (exists(select 1 from public.study_plans p where p.id=study_plan_id and p.user_id=(select auth.uid())))
with check (exists(select 1 from public.study_plans p where p.id=study_plan_id and p.user_id=(select auth.uid())));

create policy conversations_own on public.ai_conversations
for all to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);

create policy messages_own on public.ai_messages
for all to authenticated
using (exists(select 1 from public.ai_conversations c where c.id=conversation_id and c.user_id=(select auth.uid())))
with check (exists(select 1 from public.ai_conversations c where c.id=conversation_id and c.user_id=(select auth.uid())));

create policy achievements_read on public.achievements for select to authenticated using (true);
create policy user_achievements_own on public.user_achievements
for select to authenticated
using ((select auth.uid())=user_id);
