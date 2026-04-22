DROP FUNCTION IF EXISTS public.get_learner_leaderboard(text);

CREATE FUNCTION public.get_learner_leaderboard(p_tier text)
RETURNS TABLE (
  user_id uuid,
  name text,
  email text,
  total_points numeric,
  days_active integer,
  first_14_days numeric,
  first_60_days numeric,
  assignments numeric,
  question_bank numeric,
  videos numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_caller uuid := auth.uid();
  v_is_admin boolean := public.has_role(v_caller, 'admin') OR public.has_role(v_caller, 'master_admin');
  v_tier text;
BEGIN
  v_tier := CASE
    WHEN p_tier = 'level_1' THEN 'papers_taker'
    WHEN p_tier = 'level_2' THEN 'post_rnf'
    ELSE p_tier
  END;

  RETURN QUERY
  WITH tier_users AS (
    SELECT DISTINCT t.user_id::uuid AS user_id
    FROM public.user_access_tiers t
    WHERE CASE
      WHEN t.tier_level = 'level_1' THEN 'papers_taker'
      WHEN t.tier_level = 'level_2' THEN 'post_rnf'
      ELSE t.tier_level
    END = v_tier
  ),
  visible_users AS (
    SELECT tu.user_id
    FROM tier_users tu
    LEFT JOIN public.profiles p ON p.user_id = tu.user_id::text
    WHERE v_is_admin
      OR tu.user_id = v_caller
      OR COALESCE(p.show_in_leaderboard, true) = true
  ),
  f14 AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS f14_quiz
    FROM public.first_14_days_progress
    GROUP BY user_id
  ),
  f60 AS (
    SELECT user_id, COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS f60_quiz
    FROM public.first_60_days_progress
    GROUP BY user_id
  ),
  asg AS (
    SELECT user_id, COUNT(DISTINCT item_id)::numeric AS asg_count
    FROM public.assignment_submissions
    WHERE product_id = 'first-60-days-assignments'
    GROUP BY user_id
  ),
  qb AS (
    SELECT user_id::uuid AS user_id, COUNT(*)::numeric AS qb_count
    FROM public.user_question_progress
    WHERE total_correct > 0
    GROUP BY user_id
  ),
  vid AS (
    SELECT user_id, COUNT(*)::numeric AS vid_count
    FROM public.video_progress
    WHERE completed = true
      AND product_id NOT IN ('onboarding', 'm9', 'm9a', 'hi', 'res5')
    GROUP BY user_id
  ),
  days AS (
    SELECT src.user_id, COUNT(DISTINCT src.activity_day)::int AS days_active
    FROM (
      SELECT user_id, DATE(quiz_passed_at) AS activity_day
      FROM public.first_14_days_progress WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(updated_at) AS activity_day
      FROM public.first_14_days_progress WHERE updated_at IS NOT NULL
      UNION
      SELECT user_id, DATE(quiz_passed_at) AS activity_day
      FROM public.first_60_days_progress WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(updated_at) AS activity_day
      FROM public.first_60_days_progress WHERE updated_at IS NOT NULL
      UNION
      SELECT user_id, DATE(COALESCE(submitted_at, created_at)) AS activity_day
      FROM public.assignment_submissions
      WHERE product_id = 'first-60-days-assignments'
        AND COALESCE(submitted_at, created_at) IS NOT NULL
      UNION
      SELECT user_id::uuid AS user_id, DATE(last_answered_at) AS activity_day
      FROM public.user_question_progress
      WHERE total_correct > 0 AND last_answered_at IS NOT NULL
      UNION
      SELECT user_id, DATE(COALESCE(completed_at, updated_at)) AS activity_day
      FROM public.video_progress
      WHERE completed = true
        AND product_id NOT IN ('onboarding', 'm9', 'm9a', 'hi', 'res5')
        AND COALESCE(completed_at, updated_at) IS NOT NULL
    ) src
    GROUP BY src.user_id
  ),
  assembled AS (
    SELECT
      vu.user_id,
      p.display_name, p.first_name, p.last_name, p.email,
      COALESCE(f14.f14_quiz, 0) AS f14_quiz,
      COALESCE(f60.f60_quiz, 0) AS f60_quiz,
      COALESCE(asg.asg_count, 0) AS asg_count,
      COALESCE(qb.qb_count, 0)  AS qb_count,
      COALESCE(vid.vid_count, 0) AS vid_count,
      COALESCE(days.days_active, 0) AS days_active
    FROM visible_users vu
    LEFT JOIN public.profiles p ON p.user_id = vu.user_id::text
    LEFT JOIN f14 ON f14.user_id = vu.user_id
    LEFT JOIN f60 ON f60.user_id = vu.user_id
    LEFT JOIN asg ON asg.user_id = vu.user_id
    LEFT JOIN qb  ON qb.user_id  = vu.user_id
    LEFT JOIN vid ON vid.user_id = vu.user_id
    LEFT JOIN days ON days.user_id = vu.user_id
  )
  SELECT
    a.user_id,
    COALESCE(
      NULLIF(BTRIM(a.display_name), ''),
      NULLIF(BTRIM(CONCAT_WS(' ', a.first_name, a.last_name)), ''),
      NULLIF(BTRIM(a.email), ''),
      'Learner'
    )::text AS name,
    a.email::text,
    ROUND((
      a.f14_quiz * 5 +
      a.f60_quiz * 5 +
      a.asg_count * 50 +
      a.qb_count * 1 +
      a.vid_count * 2.5
    )::numeric, 1) AS total_points,
    a.days_active::int,
    (a.f14_quiz * 5)::numeric  AS first_14_days,
    (a.f60_quiz * 5)::numeric  AS first_60_days,
    (a.asg_count * 50)::numeric AS assignments,
    (a.qb_count * 1)::numeric  AS question_bank,
    (a.vid_count * 2.5)::numeric AS videos
  FROM assembled a
  WHERE (
    NULLIF(BTRIM(a.display_name), '') IS NOT NULL
    OR NULLIF(BTRIM(a.first_name), '') IS NOT NULL
    OR NULLIF(BTRIM(a.last_name), '') IS NOT NULL
    OR NULLIF(BTRIM(a.email), '') IS NOT NULL
    OR (a.f14_quiz + a.f60_quiz + a.asg_count + a.qb_count + a.vid_count) > 0
  )
  ORDER BY total_points DESC, days_active DESC, name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_learner_leaderboard(text) TO authenticated;