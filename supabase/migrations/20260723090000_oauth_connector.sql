-- OAuth 2.1 connector for the agent MCP/API (Dynamic Client Registration +
-- Authorization Code + PKCE). Lets an MCP client (Claude) connect without the
-- user pasting a key. The oauth edge function (service role) drives these
-- tables; RLS only exposes a user's own live tokens to the Settings screen.

create extension if not exists pgcrypto with schema extensions;

-- Registered clients (RFC 7591 Dynamic Client Registration).
create table if not exists public.oauth_clients (
  client_id     text primary key default 'cmpc_' || encode(extensions.gen_random_bytes(16), 'hex'),
  client_name   text,
  redirect_uris text[] not null,
  scope         text not null default 'read write',
  created_at    timestamptz not null default now()
);

-- Short-lived authorization codes (single use, PKCE-bound).
create table if not exists public.oauth_auth_codes (
  code_hash      text primary key,          -- sha256(raw code)
  client_id      text not null references public.oauth_clients(client_id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  redirect_uri   text not null,
  scope          text not null,
  code_challenge text not null,             -- PKCE S256 challenge (base64url)
  expires_at     timestamptz not null,
  created_at     timestamptz not null default now()
);

-- Access + refresh tokens issued to a client for a user.
create table if not exists public.oauth_tokens (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  client_id          text references public.oauth_clients(client_id) on delete set null,
  client_name        text,
  access_token_hash  text unique,           -- sha256(raw access token)
  refresh_token_hash text unique,           -- sha256(raw refresh token)
  scope              text not null,
  access_expires_at  timestamptz not null,
  window_started_at  timestamptz not null default now(),
  window_count       integer not null default 0,
  last_used_at       timestamptz,
  revoked_at         timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists oauth_tokens_user_idx on public.oauth_tokens(user_id, revoked_at);
create index if not exists oauth_tokens_access_idx on public.oauth_tokens(access_token_hash);
create index if not exists oauth_auth_codes_expires_idx on public.oauth_auth_codes(expires_at);

alter table public.oauth_clients    enable row level security;
alter table public.oauth_auth_codes enable row level security;
alter table public.oauth_tokens     enable row level security;

-- Only the token owner may read/see their connected apps (for Settings).
-- Everything else is service-role only (no policy = deny for anon/authenticated).
drop policy if exists "oauth_tokens owner select" on public.oauth_tokens;
create policy "oauth_tokens owner select" on public.oauth_tokens
  for select using (auth.uid() = user_id);

-- Per-IP fixed-window limiter for the unauthenticated OAuth endpoints.
create table if not exists public.api_rate_buckets (
  bucket_key   text primary key,
  count        integer not null default 0,
  window_start timestamptz not null default now()
);

create or replace function public.oauth_rate_check(p_key text, p_limit integer, p_window_secs integer default 60)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_rec public.api_rate_buckets%rowtype;
begin
  insert into public.api_rate_buckets(bucket_key, count, window_start)
  values (p_key, 1, now())
  on conflict (bucket_key) do nothing;
  if found then return true; end if;  -- first hit in a fresh window
  select * into v_rec from public.api_rate_buckets where bucket_key = p_key for update;
  if v_rec.window_start < now() - make_interval(secs => p_window_secs) then
    update public.api_rate_buckets set count = 1, window_start = now() where bucket_key = p_key;
    return true;
  elsif v_rec.count >= p_limit then
    return false;
  else
    update public.api_rate_buckets set count = count + 1 where bucket_key = p_key;
    return true;
  end if;
end; $$;

-- Owner revokes a connected app (soft revoke, keeps history).
create or replace function public.oauth_revoke_token(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.oauth_tokens set revoked_at = now()
   where id = p_id and user_id = auth.uid() and revoked_at is null;
end; $$;

-- Validate + fixed-window rate limit an OAuth access token (parity with API keys).
create or replace function public.oauth_authenticate(p_raw text, p_limit integer default 120)
returns table(user_id uuid, token_id uuid, scope text, rate_limited boolean)
language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text; v_rec public.oauth_tokens%rowtype; v_limited boolean := false;
begin
  if p_raw is null or p_raw = '' then return; end if;
  v_hash := encode(extensions.digest(p_raw, 'sha256'), 'hex');
  select * into v_rec from public.oauth_tokens
   where access_token_hash = v_hash and revoked_at is null and access_expires_at > now() limit 1;
  if not found then return; end if;
  if v_rec.window_started_at < now() - interval '60 seconds' then
    update public.oauth_tokens set window_started_at = now(), window_count = 1, last_used_at = now() where id = v_rec.id;
  elsif v_rec.window_count >= p_limit then
    v_limited := true; update public.oauth_tokens set last_used_at = now() where id = v_rec.id;
  else
    update public.oauth_tokens set window_count = window_count + 1, last_used_at = now() where id = v_rec.id;
  end if;
  return query select v_rec.user_id, v_rec.id, v_rec.scope, v_limited;
end; $$;

-- Housekeeping: drop expired codes, long-dead tokens, stale rate buckets.
create or replace function public.oauth_gc()
returns void language sql security definer set search_path = public as $$
  delete from public.oauth_auth_codes where expires_at < now() - interval '1 hour';
  delete from public.oauth_tokens where revoked_at is not null and revoked_at < now() - interval '30 days';
  delete from public.api_rate_buckets where window_start < now() - interval '1 hour';
$$;

revoke all on function public.oauth_revoke_token(uuid) from public, anon;
grant execute on function public.oauth_revoke_token(uuid) to authenticated;
revoke all on function public.oauth_rate_check(text, integer, integer) from public, anon, authenticated;
grant execute on function public.oauth_rate_check(text, integer, integer) to service_role;
revoke all on function public.oauth_authenticate(text, integer) from public, anon, authenticated;
grant execute on function public.oauth_authenticate(text, integer) to service_role;
revoke all on function public.oauth_gc() from public, anon, authenticated;
grant execute on function public.oauth_gc() to service_role;

-- Schedule nightly cleanup (03:17 UTC) if pg_cron is available; best-effort.
do $$
begin
  perform cron.unschedule('oauth-gc');
exception when others then null;
end $$;
do $$
begin
  perform cron.schedule('oauth-gc', '17 3 * * *', $q$select public.oauth_gc();$q$);
exception when others then
  raise notice 'pg_cron not available; oauth_gc must be called manually';
end $$;
