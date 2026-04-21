CREATE OR REPLACE FUNCTION public.get_learner_leaderboard(p_tier text)
RETURNS TABLE (
  user_id uuid,
  name text,
  email text,
  total_points numeric,
  days_active integer,
  first_14_days numeric,
  first_14_reflections numeric,
  first_60_days numeric,
  first_60_reflections numeric,
  assignments numeric,
  question_bank numeric,
  product_quizzes numeric,
  videos numeric,
  learning_track_items numeric,
  learning_track_submissions numeric
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
    SELECT
      user_id,
      COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS f14_quiz,
      COUNT(*) FILTER (WHERE reflection_saved_at IS NOT NULL)::numeric AS f14_refl
    FROM public.first_14_days_progress
    GROUP BY user_id
  ),
  f60 AS (
    SELECT
      user_id,
      COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS f60_quiz,
      COUNT(*) FILTER (WHERE reflection_submitted_at IS NOT NULL)::numeric AS f60_refl
    FROM public.first_60_days_progress
    GROUP BY user_id
  ),
  asg AS (
    SELECT
      user_id,
      COUNT(DISTINCT item_id)::numeric AS asg_count
    FROM public.assignment_submissions
    WHERE product_id = 'first-60-days-assignments'
    GROUP BY user_id
  ),
  qb AS (
    SELECT
      user_id::uuid AS user_id,
      COUNT(*)::numeric AS qb_count
    FROM public.user_question_progress
    WHERE mastered = true
    GROUP BY user_id
  ),
  pq AS (
    SELECT
      user_id,
      COUNT(*)::numeric AS pq_count
    FROM public.quiz_attempts
    GROUP BY user_id
  ),
  vid AS (
    SELECT
      user_id,
      COUNT(*)::numeric AS vid_count
    FROM public.video_progress
    WHERE completed = true
    GROUP BY user_id
  ),
  lti AS (
    SELECT
      user_id,
      COUNT(*)::numeric AS lti_count
    FROM public.learning_track_progress
    WHERE status = 'completed'
    GROUP BY user_id
  ),
  lts AS (
    SELECT
      user_id,
      COUNT(*)::numeric AS lts_count,
      COUNT(*) FILTER (WHERE review_status = 'approved')::numeric AS lts_approved_count
    FROM public.learning_track_submissions
    GROUP BY user_id
  ),
  days AS (
    SELECT src.user_id, COUNT(DISTINCT src.activity_day)::int AS days_active
    FROM (
      SELECT user_id, DATE(quiz_passed_at) AS activity_day
      FROM public.first_14_days_progress
      WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(reflection_saved_at) AS activity_day
      FROM public.first_14_days_progress
      WHERE reflection_saved_at IS NOT NULL
      UNION
      SELECT user_id, DATE(updated_at) AS activity_day
      FROM public.first_14_days_progress
      WHERE updated_at IS NOT NULL
      UNION
      SELECT user_id, DATE(quiz_passed_at) AS activity_day
      FROM public.first_60_days_progress
      WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(reflection_submitted_at) AS activity_day
      FROM public.first_60_days_progress
      WHERE reflection_submitted_at IS NOT NULL
      UNION
      SELECT user_id, DATE(updated_at) AS activity_day
      FROM public.first_60_days_progress
      WHERE updated_at IS NOT NULL
      UNION
      SELECT user_id, DATE(COALESCE(submitted_at, created_at)) AS activity_day
      FROM public.assignment_submissions
      WHERE product_id = 'first-60-days-assignments'
        AND COALESCE(submitted_at, created_at) IS NOT NULL
      UNION
      SELECT user_id::uuid AS user_id, DATE(last_answered_at) AS activity_day
      FROM public.user_question_progress
      WHERE mastered = true
        AND last_answered_at IS NOT NULL
      UNION
      SELECT user_id, DATE(completed_at) AS activity_day
      FROM public.quiz_attempts
      WHERE completed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(COALESCE(completed_at, updated_at)) AS activity_day
      FROM public.video_progress
      WHERE completed = true
        AND COALESCE(completed_at, updated_at) IS NOT NULL
      UNION
      SELECT user_id, DATE(COALESCE(completed_at, updated_at)) AS activity_day
      FROM public.learning_track_progress
      WHERE status = 'completed'
        AND COALESCE(completed_at, updated_at) IS NOT NULL
      UNION
      SELECT user_id, DATE(submitted_at) AS activity_day
      FROM public.learning_track_submissions
      WHERE submitted_at IS NOT NULL
    ) src
    GROUP BY src.user_id
  ),
  assembled AS (
    SELECT
      vu.user_id,
      p.display_name,
      p.first_name,
      p.last_name,
      p.email,
      COALESCE(f14.f14_quiz, 0) AS f14_quiz,
      COALESCE(f14.f14_refl, 0) AS f14_refl,
      COALESCE(f60.f60_quiz, 0) AS f60_quiz,
      COALESCE(f60.f60_refl, 0) AS f60_refl,
      COALESCE(asg.asg_count, 0) AS asg_count,
      COALESCE(qb.qb_count, 0) AS qb_count,
      COALESCE(pq.pq_count, 0) AS pq_count,
      COALESCE(vid.vid_count, 0) AS vid_count,
      COALESCE(lti.lti_count, 0) AS lti_count,
      COALESCE(lts.lts_count, 0) AS lts_count,
      COALESCE(lts.lts_approved_count, 0) AS lts_approved_count,
      COALESCE(days.days_active, 0) AS days_active
    FROM visible_users vu
    LEFT JOIN public.profiles p ON p.user_id = vu.user_id::text
    LEFT JOIN f14 ON f14.user_id = vu.user_id
    LEFT JOIN f60 ON f60.user_id = vu.user_id
    LEFT JOIN asg ON asg.user_id = vu.user_id
    LEFT JOIN qb ON qb.user_id = vu.user_id
    LEFT JOIN pq ON pq.user_id = vu.user_id
    LEFT JOIN vid ON vid.user_id = vu.user_id
    LEFT JOIN lti ON lti.user_id = vu.user_id
    LEFT JOIN lts ON lts.user_id = vu.user_id
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
      a.f14_quiz * 1 +
      a.f14_refl * 0.5 +
      a.f60_quiz * 1 +
      a.f60_refl * 0.5 +
      a.asg_count * 5 +
      a.qb_count * 0.5 +
      a.pq_count * 1 +
      a.vid_count * 0.5 +
      a.lti_count * 1 +
      a.lts_count * 3 +
      a.lts_approved_count * 2
    )::numeric, 1) AS total_points,
    a.days_active::int,
    (a.f14_quiz * 1)::numeric AS first_14_days,
    (a.f14_refl * 0.5)::numeric AS first_14_reflections,
    (a.f60_quiz * 1)::numeric AS first_60_days,
    (a.f60_refl * 0.5)::numeric AS first_60_reflections,
    (a.asg_count * 5)::numeric AS assignments,
    (a.qb_count * 0.5)::numeric AS question_bank,
    (a.pq_count * 1)::numeric AS product_quizzes,
    (a.vid_count * 0.5)::numeric AS videos,
    (a.lti_count * 1)::numeric AS learning_track_items,
    ((a.lts_count * 3) + (a.lts_approved_count * 2))::numeric AS learning_track_submissions
  FROM assembled a
  WHERE (
    NULLIF(BTRIM(a.display_name), '') IS NOT NULL
    OR NULLIF(BTRIM(a.first_name), '') IS NOT NULL
    OR NULLIF(BTRIM(a.last_name), '') IS NOT NULL
    OR NULLIF(BTRIM(a.email), '') IS NOT NULL
    OR (
      a.f14_quiz + a.f14_refl + a.f60_quiz + a.f60_refl + a.asg_count + a.qb_count + a.pq_count + a.vid_count + a.lti_count + a.lts_count + a.lts_approved_count
    ) > 0
  )
  ORDER BY total_points DESC, days_active DESC, name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_learner_leaderboard(text) TO authenticated;