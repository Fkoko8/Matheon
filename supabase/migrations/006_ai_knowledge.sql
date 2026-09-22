create extension if not exists vector;
create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(), source_type text not null, source_id uuid not null,
  title text not null, content text not null, embedding vector(1536), metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(source_type, source_id, title)
);
create index if not exists knowledge_chunks_metadata_idx on public.knowledge_chunks using gin(metadata);
create index if not exists knowledge_chunks_embedding_idx on public.knowledge_chunks using hnsw (embedding vector_cosine_ops);
alter table public.knowledge_chunks enable row level security;
drop policy if exists knowledge_read on public.knowledge_chunks;
create policy knowledge_read on public.knowledge_chunks for select to authenticated, anon using (true);
create table if not exists public.ai_request_logs (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null, mode text, tools text[] not null default '{}', retrieval_count integer not null default 0, response_ms integer, provider text, success boolean not null default false, created_at timestamptz not null default now());
alter table public.ai_request_logs enable row level security;
create policy ai_logs_own on public.ai_request_logs for select to authenticated using ((select auth.uid()) = user_id);
create or replace function public.match_knowledge_chunks(query_embedding vector(1536), match_count integer default 8, filter_metadata jsonb default '{}'::jsonb)
returns table(id uuid, source_type text, source_id uuid, title text, content text, metadata jsonb, similarity real)
language sql stable as $$ select k.id,k.source_type,k.source_id,k.title,k.content,k.metadata,1-(k.embedding<=>query_embedding) from public.knowledge_chunks k where k.embedding is not null and k.metadata @> filter_metadata order by k.embedding<=>query_embedding limit match_count $$;
