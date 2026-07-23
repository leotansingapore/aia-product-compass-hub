-- Per-user log of uncached analyze-ig-creator lookups, for rate capping.
create table if not exists public.ig_lookup_log (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  handle text not null,
  at timestamptz not null default now()
);
create index if not exists ig_lookup_log_user_at on public.ig_lookup_log (user_id, at desc);
alter table public.ig_lookup_log enable row level security;
