-- Manager feedback (Loom, 6 Aug 2026): a leader can see WHETHER assignments
-- were filled in, but nothing else — not the day-by-day track work, not the
-- Core Products trainings, not question-bank effort. And the surfaces that do
-- exist (leaderboard, assignment tracker, per-track admin tabs) are scattered.
--
-- get_team_progress() powers the consolidated /team-progress dashboard:
-- one row per profile with COUNTS (not points) for every tracked dimension,
-- plus tier, total points (same weights as get_learner_leaderboard: 5 pt per
-- day quiz, 50 pt per assignment, 0.2 pt per correct question, 2.5 pt per
-- Core Products video) and the learner's last activity timestamp.
--
-- Admin/master_admin only — this returns names + emails for the whole roster,
-- which peers must never see (2026-08-03 PII lockdown). Per-item drill-down
-- stays on the existing get_learner_completed_items(p_user_id).
CREATE OR REPLACE FUNCTION public.get_team_progress()
 RETURNS TABLE(
   user_id uuid,
   name text,
   email text,
   tier text,
   is_admin boolean,
   f14_done integer,
   f60_done integer,
   n60_done integer,
   pm_done integer,
   assignments_done integer,
   qb_correct integer,
   videos_done integer,
   total_points numeric,
   last_active timestamptz
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
DECLARE
  v_caller uuid := auth.uid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT (has_role(v_caller, 'admin') OR has_role(v_caller, 'master_admin')) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
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
  SELECT
    p.user_id,
    p.name,
    p.email,
    COALESCE(t.tier, 'explorer')::text AS tier,
    (has_role(p.user_id, 'admin') OR has_role(p.user_id, 'master_admin')) AS is_admin,
    COALESCE(f14.done, 0),
    COALESCE(f60.done, 0),
    COALESCE(n60.done, 0),
    COALESCE(pm.done, 0),
    COALESCE(asg.done, 0),
    COALESCE(qb.done, 0),
    COALESCE(vid.done, 0),
    (COALESCE(f14.done, 0) * 5
      + COALESCE(f60.done, 0) * 5
      + COALESCE(n60.done, 0) * 5
      + COALESCE(pm.done, 0) * 5
      + COALESCE(asg.done, 0) * 50
      + COALESCE(qb.done, 0) * 0.2
      + COALESCE(vid.done, 0) * 2.5)::numeric AS total_points,
    GREATEST(f14.last_at, f60.last_at, n60.last_at, pm.last_at, asg.last_at, vid.last_at) AS last_active
  FROM people p
  LEFT JOIN tiers t ON t.user_id = p.user_id
  LEFT JOIN f14 ON f14.user_id = p.user_id
  LEFT JOIN f60 ON f60.user_id = p.user_id
  LEFT JOIN n60 ON n60.user_id = p.user_id
  LEFT JOIN pm ON pm.user_id = p.user_id
  LEFT JOIN asg ON asg.user_id = p.user_id
  LEFT JOIN qb ON qb.user_id = p.user_id
  LEFT JOIN vid ON vid.user_id = p.user_id
  ORDER BY total_points DESC, p.name;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_team_progress() TO authenticated;

-- Flat catalog of every Core Products training video (id + title + module),
-- WITHOUT the heavy rich_content/transcript payload that lives inside
-- products.training_videos. The drill-down joins this against
-- get_learner_completed_items 'videos' rows to show per-module done/total.
CREATE OR REPLACE FUNCTION public.get_core_video_catalog()
 RETURNS TABLE(
   product_id text,
   product_title text,
   video_id text,
   video_title text,
   sort_order integer
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller uuid := auth.uid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF NOT (has_role(v_caller, 'admin') OR has_role(v_caller, 'master_admin')) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT pr.id::text,
         pr.title::text,
         (elem->>'id')::text,
         COALESCE(elem->>'title', 'Untitled video')::text,
         ord::int
  FROM public.products pr
  JOIN public.categories c ON c.id = pr.category_id
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(pr.training_videos) = 'array'
         THEN pr.training_videos ELSE '[]'::jsonb END
  ) WITH ORDINALITY AS t(elem, ord)
  WHERE c.name = 'Core Products'
  ORDER BY pr.title, ord;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_core_video_catalog() TO authenticated;
