-- Regression fix for my own 20260803001500 migration.
--
-- That migration correctly stopped cross-tier reads, but it raises whenever the
-- caller's tier can't be matched exactly — and two legitimate cases hit that:
--
--   1. No `user_access_tiers` row at all. `useUserTier` explicitly supports
--      this ("a user who pre-dates the auto-assign trigger") and sends
--      p_tier='explorer'. Verified: 1 real account is in this state today.
--   2. A legacy/unknown tier_level. The client's `normalizeTier` collapses
--      anything unrecognised to 'explorer'; the SQL kept the raw string, so
--      they disagreed.
--
-- Those users saw "Failed to load leaderboard: You can only view the
-- leaderboard for your own tier", and the rank card on their track pages
-- silently rendered nothing while re-firing the failing call. Before my change
-- they simply saw a short board.
--
-- Fix: normalise BOTH sides the same way the client does, so the comparison is
-- apples to apples. The cross-tier restriction is unchanged.
CREATE OR REPLACE FUNCTION public.normalize_tier_level(p_tier text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_tier = 'level_1' THEN 'papers_taker'
    WHEN p_tier = 'level_2' THEN 'post_rnf'
    WHEN p_tier IN ('explorer', 'papers_taker', 'post_rnf') THEN p_tier
    -- Mirrors normalizeTier() in src/lib/tiers.ts: anything unrecognised —
    -- including NULL — is Explorer, the least-privileged tier.
    ELSE 'explorer'
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_learner_leaderboard(p_tier text)
 RETURNS TABLE(user_id uuid, name text, total_points numeric, days_active integer, first_14_days numeric, first_60_days numeric, next_60_days numeric, assignments numeric, question_bank numeric, videos numeric, product_mastery numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
DECLARE
  v_caller uuid := auth.uid();
  v_tier text;
  v_caller_tier text;
  v_is_admin boolean;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_tier := public.normalize_tier_level(p_tier);
  v_is_admin := has_role(v_caller, 'admin') OR has_role(v_caller, 'master_admin');

  SELECT public.normalize_tier_level(t.tier_level)
    INTO v_caller_tier
    FROM public.user_access_tiers t
   WHERE t.user_id = v_caller::text
   LIMIT 1;

  -- No row => Explorer, exactly as the client resolves it.
  v_caller_tier := COALESCE(v_caller_tier, 'explorer');

  -- Learners see only their own cohort. Admins may inspect any tier.
  IF NOT v_is_admin AND v_caller_tier IS DISTINCT FROM v_tier THEN
    RAISE EXCEPTION 'You can only view the leaderboard for your own tier';
  END IF;

  RETURN QUERY
  WITH tier_users AS (
    SELECT DISTINCT t.user_id::uuid AS user_id
    FROM public.user_access_tiers t
    WHERE public.normalize_tier_level(t.tier_level) = v_tier
  ),
  visible_users AS (
    SELECT tu.user_id, pr.display_name, pr.first_name, pr.last_name, pr.email, pr.show_in_leaderboard
    FROM tier_users tu
    JOIN public.profiles pr ON pr.user_id = tu.user_id::text
    WHERE tu.user_id = v_caller
      OR COALESCE(pr.show_in_leaderboard, true) = true
  ),
  f14 AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS f14_quiz
    FROM public.first_14_days_progress GROUP BY user_id
  ),
  f60 AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS f60_quiz
    FROM public.first_60_days_progress GROUP BY user_id
  ),
  n60 AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS n60_quiz
    FROM public.next_60_days_progress GROUP BY user_id
  ),
  pm AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS pm_quiz
    FROM public.product_mastery_progress GROUP BY user_id
  ),
  asg AS (
    SELECT user_id, COUNT(DISTINCT item_id)::numeric AS asg_count
    FROM public.assignment_submissions
    WHERE product_id IN ('first-60-days-assignments', 'next-60-days-assignments') GROUP BY user_id
  ),
  qb AS (
    SELECT user_id::uuid AS user_id, COUNT(*)::numeric AS qb_count
    FROM public.user_question_progress WHERE total_correct > 0 GROUP BY user_id
  ),
  vid AS (
    SELECT vp.user_id, COUNT(*)::numeric AS vid_count
    FROM public.video_progress vp
    JOIN public.products pr ON pr.id = vp.product_id
    JOIN public.categories c ON c.id = pr.category_id
    WHERE vp.completed = true AND c.name = 'Core Products'
    GROUP BY vp.user_id
  ),
  days AS (
    SELECT src.user_id, COUNT(DISTINCT src.activity_day)::int AS days_active
    FROM (
      SELECT user_id, DATE(quiz_passed_at AT TIME ZONE 'Asia/Singapore') AS activity_day
        FROM public.first_14_days_progress WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(quiz_passed_at AT TIME ZONE 'Asia/Singapore')
        FROM public.first_60_days_progress WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(quiz_passed_at AT TIME ZONE 'Asia/Singapore')
        FROM public.next_60_days_progress WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(quiz_passed_at AT TIME ZONE 'Asia/Singapore')
        FROM public.product_mastery_progress WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(submitted_at AT TIME ZONE 'Asia/Singapore')
        FROM public.assignment_submissions WHERE submitted_at IS NOT NULL
    ) src
    GROUP BY src.user_id
  )
  SELECT
    vu.user_id,
    COALESCE(
      NULLIF(TRIM(vu.display_name), ''),
      NULLIF(TRIM(CONCAT_WS(' ', vu.first_name, vu.last_name)), ''),
      SPLIT_PART(vu.email, '@', 1),
      'Anonymous'
    )::text AS name,
    (COALESCE(f14.f14_quiz, 0) * 1.0
      + COALESCE(f60.f60_quiz, 0) * 1.0
      + COALESCE(n60.n60_quiz, 0) * 1.0
      + COALESCE(pm.pm_quiz, 0) * 1.0
      + COALESCE(asg.asg_count, 0) * 2.0
      + COALESCE(qb.qb_count, 0) * 0.2
      + COALESCE(vid.vid_count, 0) * 0.5)::numeric AS total_points,
    COALESCE(days.days_active, 0) AS days_active,
    COALESCE(f14.f14_quiz, 0)::numeric AS first_14_days,
    COALESCE(f60.f60_quiz, 0)::numeric AS first_60_days,
    COALESCE(n60.n60_quiz, 0)::numeric AS next_60_days,
    COALESCE(asg.asg_count, 0)::numeric AS assignments,
    COALESCE(qb.qb_count, 0)::numeric AS question_bank,
    COALESCE(vid.vid_count, 0)::numeric AS videos,
    COALESCE(pm.pm_quiz, 0)::numeric AS product_mastery
  FROM visible_users vu
  LEFT JOIN f14 ON f14.user_id = vu.user_id
  LEFT JOIN f60 ON f60.user_id = vu.user_id
  LEFT JOIN n60 ON n60.user_id = vu.user_id
  LEFT JOIN pm ON pm.user_id = vu.user_id
  LEFT JOIN asg ON asg.user_id = vu.user_id
  LEFT JOIN qb ON qb.user_id = vu.user_id
  LEFT JOIN vid ON vid.user_id = vu.user_id
  LEFT JOIN days ON days.user_id = vu.user_id
  ORDER BY total_points DESC, days_active DESC;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_learner_leaderboard(text) TO authenticated;
