-- Cache for the analyze-ig-creator edge function (Content Studio live creator
-- analysis). Service-role only: RLS enabled with no policies, so anon/authed
-- clients cannot read or write it directly.
create table if not exists public.ig_creator_cache (
  handle text primary key,
  fetched_at timestamptz not null default now(),
  data jsonb not null
);

alter table public.ig_creator_cache enable row level security;
