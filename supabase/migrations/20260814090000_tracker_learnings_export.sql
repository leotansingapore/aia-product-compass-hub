-- Learner progress, exported to Activity Tracker's Team CRM (Leo, 2026-08-14).
--
-- The tracker's manager CRM grows a "Learnings" tab that shows the same
-- academy progress a leader reads on /team-progress, next to the advisor's
-- activity numbers. The tracker is a DIFFERENT Supabase project, so its users
-- have no session here and cannot call get_team_progress() (which requires an
-- academy admin's auth.uid()).
--
-- This is the same aggregation with the caller check removed, locked to
-- service_role and reachable only through the tracker-learnings edge function,
-- which demands a shared secret. Nothing anonymous, nothing an academy learner
-- can call: REVOKE FROM PUBLIC (not just anon/authenticated — those inherit
-- the PUBLIC grant, so revoking from them alone is a no-op).
--
-- It returns EVERY learner, not a filtered set. Tracker-side matching is by
-- email, then name, then a manual link, and the academy is the wrong place to
-- own that mapping — advisors sign up here with personal gmail addresses and
-- appear in the tracker on their work aiafa.com.sg ones.

create or replace function public.get_tracker_learnings()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
#variable_conflict use_column
DECLARE
  v_rows jsonb;
  v_videos_total int;
BEGIN
  -- Denominator for the Core Products video track — data, so it is counted
  -- rather than hardcoded. Mirrors get_core_video_catalog(), including its
  -- duplicate-entry problem: at least one product lists the same lesson twice
  -- in training_videos, and a learner can only ever complete it once.
  SELECT COUNT(DISTINCT (pr.id::text || ':' || (elem->>'id')))::int
    INTO v_videos_total
  FROM public.products pr
  JOIN public.categories c ON c.id = pr.category_id
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(pr.training_videos) = 'array'
         THEN pr.training_videos ELSE '[]'::jsonb END
  ) AS elem
  WHERE c.name = 'Core Products';

  WITH people AS (
    SELECT pr.user_id::uuid AS user_id,
           COALESCE(
             NULLIF(TRIM(pr.display_name), ''),
             NULLIF(TRIM(CONCAT_WS(' ', pr.first_name, pr.last_name)), ''),
             SPLIT_PART(pr.email, '@', 1),
             'Anonymous'
           )::text AS name,
           pr.email
    FROM public.profiles pr
    WHERE pr.user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  ),
  f14 AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::int AS done,
           MAX(quiz_passed_at) AS last_at
    FROM public.first_14_days_progress GROUP BY user_id
  ),
  f60 AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::int AS done,
           MAX(quiz_passed_at) AS last_at
    FROM public.first_60_days_progress GROUP BY user_id
  ),
  n60 AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::int AS done,
           MAX(quiz_passed_at) AS last_at
    FROM public.next_60_days_progress GROUP BY user_id
  ),
  pm AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::int AS done,
           MAX(quiz_passed_at) AS last_at
    FROM public.product_mastery_progress GROUP BY user_id
  ),
  asg AS (
    SELECT user_id, COUNT(DISTINCT item_id)::int AS done, MAX(submitted_at) AS last_at
    FROM public.assignment_submissions
    WHERE product_id IN ('first-60-days-assignments', 'next-60-days-assignments')
    GROUP BY user_id
  ),
  qb AS (
    SELECT user_id::uuid AS user_id, COUNT(*)::int AS done
    FROM public.user_question_progress WHERE total_correct > 0 GROUP BY user_id
  ),
  vid AS (
    SELECT vp.user_id, COUNT(*)::int AS done,
           MAX(COALESCE(vp.completed_at, vp.updated_at)) AS last_at
    FROM public.video_progress vp
    JOIN public.products pr ON pr.id = vp.product_id
    JOIN public.categories c ON c.id = pr.category_id
    WHERE vp.completed = true AND c.name = 'Core Products'
    GROUP BY vp.user_id
  ),
  tiers AS (
    SELECT DISTINCT ON (t.user_id)
           t.user_id::uuid AS user_id,
           public.normalize_tier_level(t.tier_level) AS tier
    FROM public.user_access_tiers t
    WHERE t.user_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    ORDER BY t.user_id
  )
  SELECT COALESCE(jsonb_agg(r ORDER BY r->>'name'), '[]'::jsonb) INTO v_rows
  FROM (
    SELECT jsonb_build_object(
      'academy_user_id', p.user_id,
      'name', p.name,
      'email', p.email,
      'tier', COALESCE(t.tier, 'explorer')::text,
      'is_admin', (has_role(p.user_id, 'admin') OR has_role(p.user_id, 'master_admin')),
      'f14_done', COALESCE(f14.done, 0),
      'f60_done', COALESCE(f60.done, 0),
      'n60_done', COALESCE(n60.done, 0),
      'pm_done', COALESCE(pm.done, 0),
      'assignments_done', COALESCE(asg.done, 0),
      'qb_correct', COALESCE(qb.done, 0),
      'videos_done', COALESCE(vid.done, 0),
      'total_points', (COALESCE(f14.done, 0) * 5
        + COALESCE(f60.done, 0) * 5
        + COALESCE(n60.done, 0) * 5
        + COALESCE(pm.done, 0) * 5
        + COALESCE(asg.done, 0) * 50
        + COALESCE(qb.done, 0) * 0.2
        + COALESCE(vid.done, 0) * 2.5)::numeric,
      'last_active', GREATEST(f14.last_at, f60.last_at, n60.last_at, pm.last_at, asg.last_at, vid.last_at)
    ) AS r
    FROM people p
    LEFT JOIN tiers t ON t.user_id = p.user_id
    LEFT JOIN f14 ON f14.user_id = p.user_id
    LEFT JOIN f60 ON f60.user_id = p.user_id
    LEFT JOIN n60 ON n60.user_id = p.user_id
    LEFT JOIN pm ON pm.user_id = p.user_id
    LEFT JOIN asg ON asg.user_id = p.user_id
    LEFT JOIN qb ON qb.user_id = p.user_id
    LEFT JOIN vid ON vid.user_id = p.user_id
  ) s;

  RETURN jsonb_build_object(
    'rows', v_rows,
    -- Track lengths come from the generated day summaries in the front-end
    -- (src/features/*/summaries.ts, TOTAL_DAYS) and the assignment markdown in
    -- docs/{first,next}-60-days/assignments — none of which exist in the
    -- database. Counted 2026-08-14. If a track gains days, update this.
    'totals', jsonb_build_object(
      'f14', 14,
      'f60', 60,
      'n60', 60,
      'pm', 35,
      'assignments', 22,
      'videos', COALESCE(v_videos_total, 0)
    ),
    'generated_at', now()
  );
END;
$function$;

revoke all on function public.get_tracker_learnings() from public;
revoke all on function public.get_tracker_learnings() from anon;
revoke all on function public.get_tracker_learnings() from authenticated;
grant execute on function public.get_tracker_learnings() to service_role;

comment on function public.get_tracker_learnings() is
  'Every learner''s track progress for the Activity Tracker Team CRM Learnings tab. service_role only, reached through the tracker-learnings edge function behind a shared secret.';
