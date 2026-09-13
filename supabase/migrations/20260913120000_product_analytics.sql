-- Product analytics for the FINternship academy and the CMFAS exam prep
-- (Leo, 2026-09-13): "which features are people actually using?" Ported from
-- remix-of-activity-tracker, where the same seven aggregate RPCs drive Super
-- Admin -> Product.
--
-- TWO APPS SHARE THIS PROJECT: academy.finternship.com (app = 'academy') and
-- the CMFAS exam prep (app = 'cmfas'). Every function takes p_app first and
-- filters on props.app, so each panel reads only its own product. Rows are
-- RLS-locked to their author. Accounts are counted from auth.users because
-- the two apps keep different profile tables.
--
-- The gate is the developer: Leo's uid for the academy's browser client, and
-- the service_role claim for the exam prep's server route (which checks
-- ADMIN_EMAIL itself before calling). Not the academy's admin_role holders.

create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists app_events_event_created_idx on public.app_events (event, created_at desc);
create index if not exists app_events_user_idx on public.app_events (user_id, created_at desc);
grant select, insert on public.app_events to authenticated;
grant all on public.app_events to service_role;
alter table public.app_events enable row level security;
drop policy if exists "insert own events" on public.app_events;
create policy "insert own events" on public.app_events
  for insert to authenticated with check (user_id = auth.uid());

create or replace function public.product_analytics_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select auth.uid() = '40f07a18-b087-4c95-ba1f-d5444222968a'  -- tanjunsing@gmail.com
      or coalesce(current_setting('request.jwt.claims', true)::json->>'role', '') = 'service_role'
$$;
grant execute on function public.product_analytics_admin() to authenticated, service_role;
revoke execute on function public.product_analytics_admin() from public, anon;

-- ---------------------------------------------------------------------------
-- One row of headline numbers, each against the period immediately before it.
-- dau/wau/mau are fixed 1/7/30-day windows regardless of p_days, because those
-- three have standard meanings and stickiness (dau_avg/mau) is only comparable
-- if they do.
-- ---------------------------------------------------------------------------
create or replace function public.app_usage_overview(p_app text, p_days int default 30)
returns table (
  active_users bigint, prior_active_users bigint,
  new_users bigint, prior_new_users bigint,
  events bigint, prior_events bigint,
  dau bigint, dau_avg numeric, wau bigint, mau bigint,
  tracked_users bigint, total_profiles bigint
)
language sql security definer stable set search_path = public as $$
  with b as (
    select now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180))) as w_start,
           now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)) * 2) as p_start
  ),
  ok as (select public.product_analytics_admin() as yes),
  ev as (select e.* from public.app_events e, ok where ok.yes and e.props->>'app' = p_app),
  firsts as (select user_id, min(created_at) as first_at from ev group by 1),
  win as (select ev.* from ev, b where ev.created_at >= b.w_start),
  pri as (select ev.* from ev, b where ev.created_at >= b.p_start and ev.created_at < b.w_start),
  per_day as (select date_trunc('day', created_at)::date d, count(distinct user_id) u from win group by 1)
  select
    (select count(distinct user_id) from win),
    (select count(distinct user_id) from pri),
    (select count(*) from firsts f, b where f.first_at >= b.w_start),
    (select count(*) from firsts f, b where f.first_at >= b.p_start and f.first_at < b.w_start),
    (select count(*) from win),
    (select count(*) from pri),
    (select count(distinct user_id) from ev where created_at >= now() - interval '1 day'),
    (select coalesce(round(avg(u), 1), 0) from per_day),
    (select count(distinct user_id) from ev where created_at >= now() - interval '7 days'),
    (select count(distinct user_id) from ev where created_at >= now() - interval '30 days'),
    (select count(distinct user_id) from ev),
    (select count(*) from auth.users u, ok where ok.yes)
$$;

-- ---------------------------------------------------------------------------
-- Per-feature adoption. The base set is every feature EVER recorded, not the
-- features recorded in this window, so a screen that fell to zero still has a
-- row carrying its zero. Going dark is the single most useful thing this table
-- can say, and building the base set from the current window is exactly how
-- you never hear it.
--
-- It also makes the panel's absences honest. A key with no row here has never
-- been recorded once - a screen whose tracking was only just added - which is
-- a completely different fact from a screen people stopped opening, and the
-- two are indistinguishable if the base set is a window.
-- ---------------------------------------------------------------------------
create or replace function public.app_feature_adoption(p_app text, p_days int default 30)
returns table (
  feature text, users bigint, opens bigint, user_days bigint,
  repeat_users bigint, new_users bigint,
  prior_users bigint, prior_opens bigint,
  first_seen timestamptz, last_seen timestamptz
)
language sql security definer stable set search_path = public as $$
  with b as (
    select now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180))) as w_start,
           now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)) * 2) as p_start
  ),
  ok as (select public.product_analytics_admin() as yes),
  o as (
    select coalesce(e.props->>'feature', 'unknown') as f, e.user_id, e.created_at
    from public.app_events e, ok
    where ok.yes and e.props->>'app' = p_app and e.event = 'feature_open'
  ),
  firsts as (select f, user_id, min(created_at) as first_at from o group by 1, 2),
  win as (select o.* from o, b where o.created_at >= b.w_start),
  pri as (select o.* from o, b where o.created_at >= b.p_start and o.created_at < b.w_start),
  feats as (select distinct f from o),
  agg as (
    select f, count(*) as opens, count(distinct user_id) as users,
           count(distinct (user_id::text || to_char(created_at, 'YYYYMMDD'))) as user_days,
           max(created_at) as last_seen
    from win group by 1
  ),
  rep as (
    select f, count(*) as repeat_users
    from (select f, user_id from win group by 1, 2 having count(distinct date_trunc('day', created_at)) > 1) x
    group by 1
  ),
  nu as (select f, count(*) as new_users from firsts, b where firsts.first_at >= b.w_start group by 1),
  pa as (select f, count(*) as prior_opens, count(distinct user_id) as prior_users from pri group by 1),
  fs as (select f, min(first_at) as first_seen from firsts group by 1)
  select t.f,
         coalesce(a.users, 0), coalesce(a.opens, 0), coalesce(a.user_days, 0),
         coalesce(r.repeat_users, 0), coalesce(n.new_users, 0),
         coalesce(p.prior_users, 0), coalesce(p.prior_opens, 0),
         fs.first_seen, a.last_seen
  from feats t
  left join agg a on a.f = t.f
  left join rep r on r.f = t.f
  left join nu n on n.f = t.f
  left join pa p on p.f = t.f
  left join fs on fs.f = t.f
  order by coalesce(a.users, 0) desc, coalesce(a.opens, 0) desc
$$;

-- ---------------------------------------------------------------------------
-- Daily actives, for the trend line. feature_opens is split out so a day made
-- entirely of background Telegram/Lark events cannot read as in-app use.
-- ---------------------------------------------------------------------------
create or replace function public.app_daily_active(p_app text, p_days int default 30)
returns table (day date, users bigint, events bigint, feature_opens bigint)
language sql security definer stable set search_path = public as $$
  select date_trunc('day', e.created_at)::date,
         count(distinct e.user_id),
         count(*),
         count(*) filter (where e.event = 'feature_open')
  from public.app_events e
  where public.product_analytics_admin() and e.props->>'app' = p_app
    and e.created_at >= now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)))
  group by 1
  order by 1
$$;

-- ---------------------------------------------------------------------------
-- Every event name, with the same union-of-both-windows rule as features so a
-- tracker that stopped firing (a rename, a regression) is visible as a drop to
-- zero rather than as an absent row.
-- ---------------------------------------------------------------------------
create or replace function public.app_event_volume(p_app text, p_days int default 30)
returns table (event text, n bigint, users bigint, prior_n bigint, prior_users bigint, last_seen timestamptz)
language sql security definer stable set search_path = public as $$
  with b as (
    select now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180))) as w_start,
           now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)) * 2) as p_start
  ),
  ok as (select public.product_analytics_admin() as yes),
  ev as (select e.event, e.user_id, e.created_at from public.app_events e, ok where ok.yes and e.props->>'app' = p_app),
  win as (select ev.* from ev, b where ev.created_at >= b.w_start),
  pri as (select ev.* from ev, b where ev.created_at >= b.p_start and ev.created_at < b.w_start),
  names as (select event from win union select event from pri),
  a as (select event, count(*) n, count(distinct user_id) users, max(created_at) last_seen from win group by 1),
  p as (select event, count(*) n, count(distinct user_id) users from pri group by 1)
  select nm.event, coalesce(a.n, 0), coalesce(a.users, 0), coalesce(p.n, 0), coalesce(p.users, 0), a.last_seen
  from names nm
  left join a on a.event = nm.event
  left join p on p.event = nm.event
  order by coalesce(a.n, 0) desc
$$;

-- ---------------------------------------------------------------------------
-- Weekly retention triangle. A cohort is the week of a user's FIRST EVER
-- event, and week_offset counts whole weeks from there, so offset 0 is always
-- 100% by construction and offset 1 is the number that matters.
-- ---------------------------------------------------------------------------
create or replace function public.app_retention_cohorts(p_app text, p_weeks int default 8)
returns table (cohort_week date, cohort_size bigint, week_offset int, users bigint)
language sql security definer stable set search_path = public as $$
  with n as (select greatest(2, least(coalesce(p_weeks, 8), 26)) as w),
  ok as (select public.product_analytics_admin() as yes),
  ev as (select e.user_id, e.created_at from public.app_events e, ok where ok.yes and e.props->>'app' = p_app),
  firsts as (select user_id, min(created_at) as first_at from ev group by 1),
  coh as (
    select f.user_id, date_trunc('week', f.first_at)::date as cw
    from firsts f, n
    where f.first_at >= date_trunc('week', now()) - make_interval(weeks => n.w - 1)
  ),
  sizes as (select cw, count(*) as sz from coh group by 1),
  acts as (
    select distinct c.cw, c.user_id,
           ((date_trunc('week', e.created_at)::date - c.cw) / 7)::int as wk
    from coh c join ev e on e.user_id = c.user_id
  )
  select s.cw, s.sz, a.wk, count(*)
  from sizes s join acts a on a.cw = s.cw, n
  where a.wk >= 0 and a.wk < n.w
  group by 1, 2, 3
  order by 1 desc, 3
$$;

-- ---------------------------------------------------------------------------
-- How deep engagement goes: users bucketed by how many distinct days they were
-- active in the window. One long tail of one-day visitors and a handful of
-- daily users is a very different product from an even spread, and the average
-- hides both.
-- ---------------------------------------------------------------------------
create or replace function public.app_user_engagement(p_app text, p_days int default 30)
returns table (bucket text, sort_order int, users bigint)
language sql security definer stable set search_path = public as $$
  with days as (
    select e.user_id, count(distinct date_trunc('day', e.created_at)) as d
    from public.app_events e
    where public.product_analytics_admin() and e.props->>'app' = p_app
      and e.created_at >= now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)))
    group by 1
  ),
  labelled as (
    select case when d = 1 then '1 day'
                when d between 2 and 3 then '2-3 days'
                when d between 4 and 7 then '4-7 days'
                when d between 8 and 14 then '8-14 days'
                else '15+ days' end as bucket,
           case when d = 1 then 1
                when d between 2 and 3 then 2
                when d between 4 and 7 then 3
                when d between 8 and 14 then 4
                else 5 end as sort_order
    from days
  )
  select bucket, sort_order, count(*) from labelled group by 1, 2 order by 2
$$;

-- ---------------------------------------------------------------------------
-- One feature's daily shape, for the drill-down.
-- ---------------------------------------------------------------------------
create or replace function public.app_feature_detail(p_app text, p_feature text, p_days int default 30)
returns table (day date, users bigint, opens bigint)
language sql security definer stable set search_path = public as $$
  select date_trunc('day', e.created_at)::date,
         count(distinct e.user_id),
         count(*)
  from public.app_events e
  where public.product_analytics_admin() and e.props->>'app' = p_app
    and e.event = 'feature_open'
    and coalesce(e.props->>'feature', 'unknown') = p_feature
    and e.created_at >= now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)))
  group by 1
  order by 1
$$;

grant execute on function public.app_usage_overview(text, int) to authenticated, service_role;
grant execute on function public.app_feature_adoption(text, int) to authenticated, service_role;
grant execute on function public.app_daily_active(text, int) to authenticated, service_role;
grant execute on function public.app_event_volume(text, int) to authenticated, service_role;
grant execute on function public.app_retention_cohorts(text, int) to authenticated, service_role;
grant execute on function public.app_user_engagement(text, int) to authenticated, service_role;
grant execute on function public.app_feature_detail(text, text, int) to authenticated, service_role;

-- Nothing here is reachable with the publishable key. The 2026-08-13 inventory
-- found app_events_funnel answering to the anon key alone, because `create
-- function` grants EXECUTE to PUBLIC by default and a body gate only decides
-- what comes back, not who may call.
revoke execute on function public.app_usage_overview(text, int) from public, anon;
revoke execute on function public.app_feature_adoption(text, int) from public, anon;
revoke execute on function public.app_daily_active(text, int) from public, anon;
revoke execute on function public.app_event_volume(text, int) from public, anon;
revoke execute on function public.app_retention_cohorts(text, int) from public, anon;
revoke execute on function public.app_user_engagement(text, int) from public, anon;
revoke execute on function public.app_feature_detail(text, text, int) from public, anon;
