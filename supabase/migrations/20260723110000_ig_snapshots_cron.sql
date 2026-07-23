-- Monthly competitor auto-refresh: snapshot history + cron trigger.
create table if not exists public.ig_creator_snapshots (
  id bigint generated always as identity primary key,
  handle text not null,
  taken_at timestamptz not null,
  data jsonb not null
);
create index if not exists ig_creator_snapshots_handle_at
  on public.ig_creator_snapshots (handle, taken_at desc);
alter table public.ig_creator_snapshots enable row level security;

-- One row per bulk-refresh run; the edge function refuses to run twice
-- within 20 hours (cost guard even if the trigger secret leaks).
create table if not exists public.ig_refresh_runs (
  at timestamptz not null default now()
);
alter table public.ig_refresh_runs enable row level security;

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Monthly (1st, 02:00 UTC): ask the edge function to re-pull every cached
-- handle. SECRET NOTE: the real x-refresh-secret is applied out-of-band
-- (Management API) and lives only in cron.job + edge function secrets —
-- never commit it. An earlier revision of this file embedded a literal
-- secret; that value has been rotated and is dead. To rotate again:
-- `supabase secrets set REFRESH_SECRET=...`, then cron.unschedule +
-- cron.schedule with the new header value.
select cron.unschedule('refresh-ig-creators-monthly')
  where exists (select 1 from cron.job where jobname = 'refresh-ig-creators-monthly');
select cron.schedule(
  'refresh-ig-creators-monthly',
  '0 2 1 * *',
  $$
  select net.http_post(
    url := 'https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/refresh-ig-creators',
    headers := jsonb_build_object('Content-Type','application/json','x-refresh-secret','{{REFRESH_SECRET}}'),
    body := '{}'::jsonb
  );
  $$
);
