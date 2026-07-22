-- Agent access: personal API keys so a user can connect an AI agent (Claude, a
-- bot, a script) to their scheduling account over the REST api / MCP.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.api_keys (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  key_hash          text not null unique,
  prefix            text not null,
  scopes            text[] not null default array['read']::text[],
  last_used_at      timestamptz,
  request_count     bigint not null default 0,
  window_started_at timestamptz not null default now(),
  window_count      integer not null default 0,
  expires_at        timestamptz,
  revoked_at        timestamptz,
  created_at        timestamptz not null default now()
);
create index if not exists api_keys_user_id_idx on public.api_keys(user_id);
create index if not exists api_keys_key_hash_idx on public.api_keys(key_hash);

alter table public.api_keys enable row level security;
drop policy if exists "api_keys owner select" on public.api_keys;
create policy "api_keys owner select" on public.api_keys for select using (auth.uid() = user_id);
drop policy if exists "api_keys owner delete" on public.api_keys;
create policy "api_keys owner delete" on public.api_keys for delete using (auth.uid() = user_id);

create or replace function public.api_create_key(p_name text, p_scopes text[] default array['read'], p_expires_in_days integer default null)
returns table(id uuid, raw_key text, prefix text)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_uid uuid := auth.uid(); v_secret text; v_raw text; v_prefix text; v_hash text; v_id uuid;
  v_scopes text[] := coalesce(nullif(p_scopes, '{}'), array['read']);
  v_expires timestamptz := case when p_expires_in_days is not null and p_expires_in_days > 0
                                then now() + make_interval(days => p_expires_in_days) else null end;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if coalesce(trim(p_name),'')='' then raise exception 'name is required'; end if;
  if not (v_scopes <@ array['read','write']) then raise exception 'invalid scope'; end if;
  v_secret := encode(extensions.gen_random_bytes(24),'hex');
  v_raw := 'cmp_live_'||v_secret;
  v_prefix := 'cmp_live_'||substr(v_secret,1,6);
  v_hash := encode(extensions.digest(v_raw,'sha256'),'hex');
  insert into public.api_keys(user_id,name,key_hash,prefix,scopes,expires_at)
  values (v_uid, trim(p_name), v_hash, v_prefix, v_scopes, v_expires) returning api_keys.id into v_id;
  return query select v_id, v_raw, v_prefix;
end; $$;

create or replace function public.api_revoke_key(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin update public.api_keys set revoked_at = now() where id = p_id and user_id = auth.uid() and revoked_at is null; end; $$;

create or replace function public.api_authenticate(p_raw text, p_limit integer default 120)
returns table(user_id uuid, key_id uuid, scopes text[], rate_limited boolean)
language plpgsql security definer set search_path = public, extensions as $$
declare v_hash text; v_rec public.api_keys%rowtype; v_limited boolean := false;
begin
  if p_raw is null or p_raw = '' then return; end if;
  v_hash := encode(extensions.digest(p_raw,'sha256'),'hex');
  select * into v_rec from public.api_keys
   where key_hash=v_hash and revoked_at is null and (expires_at is null or expires_at > now()) limit 1;
  if not found then return; end if;
  if v_rec.window_started_at < now() - interval '60 seconds' then
    update public.api_keys set window_started_at=now(), window_count=1, last_used_at=now(), request_count=request_count+1 where id=v_rec.id;
  elsif v_rec.window_count >= p_limit then
    v_limited := true; update public.api_keys set last_used_at=now() where id=v_rec.id;
  else
    update public.api_keys set window_count=window_count+1, last_used_at=now(), request_count=request_count+1 where id=v_rec.id;
  end if;
  return query select v_rec.user_id, v_rec.id, v_rec.scopes, v_limited;
end; $$;

revoke all on function public.api_create_key(text, text[], integer) from public, anon;
revoke all on function public.api_revoke_key(uuid) from public, anon;
revoke all on function public.api_authenticate(text, integer) from public, anon, authenticated;
grant execute on function public.api_create_key(text, text[], integer) to authenticated;
grant execute on function public.api_revoke_key(uuid) to authenticated;
grant execute on function public.api_authenticate(text, integer) to service_role;
