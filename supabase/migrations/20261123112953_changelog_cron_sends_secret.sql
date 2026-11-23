-- generate-changelog-weekly (job 2) authenticated with the public anon key, so
-- the function it calls could not tell the cron from a stranger. Job 2 is owned
-- by supabase_read_only_user, which the postgres role cannot alter or remove, so
-- a postgres-owned twin on the same schedule sends x-cron-secret from the vault
-- instead (secret changelog_cron_secret, created out of band; the same value is
-- the function secret CHANGELOG_CRON_SECRET). The function now refuses any other
-- caller who is not an admin, so job 2 gets a 401 each Monday until it is deleted
-- from the dashboard.
select cron.schedule(
  'generate-changelog-weekly-secret',
  '0 0 * * 1',
  $cmd$
  select net.http_post(
    url := 'https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/generate-changelog-entries',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'changelog_cron_secret')
    ),
    body := '{"daysBack": 7}'::jsonb
  ) as request_id;
  $cmd$
);
