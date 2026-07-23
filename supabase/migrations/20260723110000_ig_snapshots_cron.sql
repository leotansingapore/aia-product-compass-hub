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

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Monthly (1st, 02:00 UTC): ask the edge function to re-pull every cached
-- handle. Secret gates the endpoint; body kept empty.
select cron.unschedule('refresh-ig-creators-monthly')
  where exists (select 1 from cron.job where jobname = 'refresh-ig-creators-monthly');
select cron.schedule(
  'refresh-ig-creators-monthly',
  '0 2 1 * *',
  $$
  select net.http_post(
    url := 'https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/refresh-ig-creators',
    headers := jsonb_build_object('Content-Type','application/json','x-refresh-secret','c115155e8220d0e2c170d725eeaf4813d04af81e40055648'),
    body := '{}'::jsonb
  );
  $$
);
