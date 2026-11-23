-- biweekly-changelog-digest (job 1) called send-changelog-digest with the public
-- anon key, and one call emails every user, so anyone could mail the whole
-- platform. Like job 2 it is owned by supabase_read_only_user, which postgres
-- cannot alter, so a postgres-owned twin on the same schedule sends x-cron-secret
-- from the vault (changelog_cron_secret, shared with the changelog writer's cron).
-- Job 1 then gets a 401 each Monday until it is deleted from the dashboard.
select cron.schedule(
  'changelog-digest-weekly-secret',
  '0 1 * * 1',
  $cmd$
  select net.http_post(
    url := 'https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/send-changelog-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'changelog_cron_secret')
    ),
    body := '{"windowDays": 14}'::jsonb
  ) as request_id;
  $cmd$
);
