alter table public.study_plans
  add column if not exists target_score integer,
  add column if not exists exam_date date,
  add column if not exists study_days integer[] not null default '{1,2,3,4,5}',
  add column if not exists preferred_session_minutes integer not null default 30,
  add column if not exists paused_at timestamptz;

alter table public.study_plan_items
  add column if not exists title text not null default 'Sesja nauki',
  add column if not exists description text not null default '',
  add column if not exists priority integer not null default 50,
  add column if not exists reason text not null default '',
  add column if not exists estimated_minutes integer not null default 15,
  add column if not exists source_type text,
  add column if not exists source_id uuid,
  add column if not exists completed_at timestamptz,
  add column if not exists missed_at timestamptz;

create index if not exists study_plans_user_status_idx on public.study_plans(user_id,status);
create index if not exists study_plan_items_plan_date_idx on public.study_plan_items(study_plan_id,scheduled_date,status);

alter table public.study_plans drop constraint if exists study_plans_target_score_check;
alter table public.study_plans add constraint study_plans_target_score_check check (target_score is null or target_score between 1 and 100);
alter table public.study_plan_items drop constraint if exists study_plan_items_estimated_minutes_check;
alter table public.study_plan_items add constraint study_plan_items_estimated_minutes_check check (estimated_minutes > 0);
