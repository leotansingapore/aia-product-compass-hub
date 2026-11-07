-- Product analytics leaves out the developer and test accounts (academy
-- monthly analytics pass). WRITTEN AFTER THE FACT: the 2026-10-07 pass applied
-- this to production through the Management API and then died at the session
-- limit before committing, so for a month production ran SQL the repo did not
-- carry. This file is pg_get_functiondef() of production on 2026-11-07, so
-- applying it changes nothing; it exists so the repo and the database agree.
--
-- Left out: tanjunsing@gmail.com (the developer, the same uid as
-- product_analytics_admin()), every @demo.com / @mailinator.com / @example.com
-- / .test / .demo / .invalid login (the demo accounts every QA run signs in
-- as), and athenateamcleaning@gmail.com, the CMFAS QA manager (added by the
-- CMFAS pass, examprep-app 20261008030000; it has no academy rows). The rows
-- are still written; only the seven RPCs stop counting them.
--
-- THE PROJECT IS SHARED with the CMFAS exam prep, which reads the same seven
-- functions with p_app = 'cmfas'. Any change here changes that panel too, and
-- examprep-app's copy of the list must move with this one.

create or replace function public.analytics_excluded_user_ids()
 RETURNS TABLE(id uuid)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select u.id from auth.users u
  where u.id = '40f07a18-b087-4c95-ba1f-d5444222968a'  -- the developer, as in product_analytics_admin()
     or u.email ~* '(@demo\.com|@mailinator\.com|@example\.com|\.test|\.demo|\.invalid)$'
     or lower(u.email) = 'athenateamcleaning@gmail.com'  -- CMFAS QA manager
$function$;

create or replace function public.app_daily_active(p_app text, p_days integer DEFAULT 30)
 RETURNS TABLE(day date, users bigint, events bigint, feature_opens bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select date_trunc('day', e.created_at)::date,
         count(distinct e.user_id),
         count(*),
         count(*) filter (where e.event = 'feature_open')
  from public.app_events e
  where public.product_analytics_admin() and e.props->>'app' = p_app and e.user_id not in (select id from public.analytics_excluded_user_ids())
    and e.created_at >= now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)))
  group by 1
  order by 1
$function$;

create or replace function public.app_event_volume(p_app text, p_days integer DEFAULT 30)
 RETURNS TABLE(event text, n bigint, users bigint, prior_n bigint, prior_users bigint, last_seen timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with b as (
    select now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180))) as w_start,
           now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)) * 2) as p_start
  ),
  ok as (select public.product_analytics_admin() as yes),
  ev as (select e.event, e.user_id, e.created_at from public.app_events e, ok where ok.yes and e.props->>'app' = p_app and e.user_id not in (select id from public.analytics_excluded_user_ids())),
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
$function$;

create or replace function public.app_feature_adoption(p_app text, p_days integer DEFAULT 30)
 RETURNS TABLE(feature text, users bigint, opens bigint, user_days bigint, repeat_users bigint, new_users bigint, prior_users bigint, prior_opens bigint, first_seen timestamp with time zone, last_seen timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with b as (
    select now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180))) as w_start,
           now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)) * 2) as p_start
  ),
  ok as (select public.product_analytics_admin() as yes),
  o as (
    select coalesce(e.props->>'feature', 'unknown') as f, e.user_id, e.created_at
    from public.app_events e, ok
    where ok.yes and e.props->>'app' = p_app and e.user_id not in (select id from public.analytics_excluded_user_ids()) and e.event = 'feature_open'
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
$function$;

create or replace function public.app_feature_detail(p_app text, p_feature text, p_days integer DEFAULT 30)
 RETURNS TABLE(day date, users bigint, opens bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select date_trunc('day', e.created_at)::date,
         count(distinct e.user_id),
         count(*)
  from public.app_events e
  where public.product_analytics_admin() and e.props->>'app' = p_app and e.user_id not in (select id from public.analytics_excluded_user_ids())
    and e.event = 'feature_open'
    and coalesce(e.props->>'feature', 'unknown') = p_feature
    and e.created_at >= now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)))
  group by 1
  order by 1
$function$;

create or replace function public.app_retention_cohorts(p_app text, p_weeks integer DEFAULT 8)
 RETURNS TABLE(cohort_week date, cohort_size bigint, week_offset integer, users bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with n as (select greatest(2, least(coalesce(p_weeks, 8), 26)) as w),
  ok as (select public.product_analytics_admin() as yes),
  ev as (select e.user_id, e.created_at from public.app_events e, ok where ok.yes and e.props->>'app' = p_app and e.user_id not in (select id from public.analytics_excluded_user_ids())),
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
$function$;

create or replace function public.app_usage_overview(p_app text, p_days integer DEFAULT 30)
 RETURNS TABLE(active_users bigint, prior_active_users bigint, new_users bigint, prior_new_users bigint, events bigint, prior_events bigint, dau bigint, dau_avg numeric, wau bigint, mau bigint, tracked_users bigint, total_profiles bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with b as (
    select now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180))) as w_start,
           now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 180)) * 2) as p_start
  ),
  ok as (select public.product_analytics_admin() as yes),
  ev as (select e.* from public.app_events e, ok where ok.yes and e.props->>'app' = p_app and e.user_id not in (select id from public.analytics_excluded_user_ids())),
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
    (select count(*) from auth.users u, ok where ok.yes and u.id not in (select id from public.analytics_excluded_user_ids()))
$function$;

create or replace function public.app_user_engagement(p_app text, p_days integer DEFAULT 30)
 RETURNS TABLE(bucket text, sort_order integer, users bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with days as (
    select e.user_id, count(distinct date_trunc('day', e.created_at)) as d
    from public.app_events e
    where public.product_analytics_admin() and e.props->>'app' = p_app and e.user_id not in (select id from public.analytics_excluded_user_ids())
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
$function$;


revoke execute on function public.analytics_excluded_user_ids() from public, anon, authenticated;
grant execute on function public.analytics_excluded_user_ids() to service_role;
