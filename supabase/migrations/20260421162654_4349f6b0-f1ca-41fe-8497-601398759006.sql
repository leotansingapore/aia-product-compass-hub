CREATE OR REPLACE FUNCTION public.get_learner_leaderboard(p_tier text)
 RETURNS TABLE(user_id uuid, name text, email text, total_points numeric, days_active integer, first_14_days numeric, first_14_reflections numeric, first_60_days numeric, first_60_reflections numeric, assignments numeric, question_bank numeric, product_quizzes numeric, videos numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    SELECT t.user_id
    FROM public.user_access_tiers t
    WHERE CASE
      WHEN t.tier_level IN ('level_1') THEN 'papers_taker'
      WHEN t.tier_level IN ('level_2') THEN 'post_rnf'
      ELSE t.tier_level
    END = v_tier
  ),
  visible_users AS (
    SELECT tu.user_id
    FROM tier_users tu
    LEFT JOIN public.profiles p ON p.user_id::uuid = tu.user_id
    WHERE
      v_is_admin
      OR tu.user_id = v_caller
      OR COALESCE(p.show_in_leaderboard, true) = true
  ),
  f14 AS (
    SELECT user_id,
      COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS f14_quiz,
      COUNT(*) FILTER (WHERE reflection_saved_at IS NOT NULL)::numeric AS f14_refl
    FROM public.first_14_days_progress
    GROUP BY user_id
  ),
  f60 AS (
    SELECT user_id,
      COUNT(*) FILTER (WHERE quiz_passed_at IS NOT NULL)::numeric AS f60_quiz,
      COUNT(*) FILTER (WHERE reflection_submitted_at IS NOT NULL)::numeric AS f60_refl
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
    WHERE mastered = true
    GROUP BY user_id
  ),
  pq AS (
    SELECT user_id, COUNT(*)::numeric AS pq_count
    FROM public.quiz_attempts
    GROUP BY user_id
  ),
  vid AS (
    SELECT user_id, COUNT(*)::numeric AS vid_count
    FROM public.video_progress
    WHERE completed = true
    GROUP BY user_id
  ),
  days AS (
    SELECT u, COUNT(DISTINCT d) AS days_active FROM (
      SELECT user_id AS u, DATE(quiz_passed_at) AS d FROM public.first_14_days_progress WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(reflection_saved_at) FROM public.first_14_days_progress WHERE reflection_saved_at IS NOT NULL
      UNION
      SELECT user_id, DATE(updated_at) FROM public.first_14_days_progress
      UNION
      SELECT user_id, DATE(quiz_passed_at) FROM public.first_60_days_progress WHERE quiz_passed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(reflection_submitted_at) FROM public.first_60_days_progress WHERE reflection_submitted_at IS NOT NULL
      UNION
      SELECT user_id, DATE(updated_at) FROM public.first_60_days_progress
      UNION
      SELECT user_id, DATE(COALESCE(submitted_at, created_at)) FROM public.assignment_submissions WHERE product_id = 'first-60-days-assignments'
      UNION
      SELECT user_id::uuid, DATE(last_answered_at) FROM public.user_question_progress WHERE mastered = true AND last_answered_at IS NOT NULL
      UNION
      SELECT user_id, DATE(completed_at) FROM public.quiz_attempts WHERE completed_at IS NOT NULL
      UNION
      SELECT user_id, DATE(COALESCE(completed_at, updated_at)) FROM public.video_progress WHERE completed = true
    ) src
    GROUP BY u
  ),
  assembled AS (
    SELECT
      vu.user_id,
      p.display_name,
      p.first_name,
      p.last_name,
      p.email,
      f14.f14_quiz, f14.f14_refl,
      f60.f60_quiz, f60.f60_refl,
      asg.asg_count,
      qb.qb_count,
      pq.pq_count,
      vid.vid_count,
      days.days_active
    FROM visible_users vu
    LEFT JOIN public.profiles p ON p.user_id::uuid = vu.user_id
    LEFT JOIN f14 ON f14.user_id = vu.user_id
    LEFT JOIN f60 ON f60.user_id = vu.user_id
    LEFT JOIN asg ON asg.user_id = vu.user_id
    LEFT JOIN qb  ON qb.user_id  = vu.user_id
    LEFT JOIN pq  ON pq.user_id  = vu.user_id
    LEFT JOIN vid ON vid.user_id = vu.user_id
    LEFT JOIN days ON days.u = vu.user_id
  )
  SELECT
    a.user_id,
    COALESCE(NULLIF(TRIM(a.display_name), ''),
             NULLIF(TRIM(CONCAT_WS(' ', a.first_name, a.last_name)), ''),
             a.email,
             SUBSTRING(a.user_id::text, 1, 8))::text AS name,
    a.email::text,
    ROUND(
      (COALESCE(a.f14_quiz,0) * 1
       + COALESCE(a.f14_refl,0) * 0.5
       + COALESCE(a.f60_quiz,0) * 1
       + COALESCE(a.f60_refl,0) * 0.5
       + COALESCE(a.asg_count,0) * 5
       + COALESCE(a.qb_count,0) * 0.5
       + COALESCE(a.pq_count,0) * 1
       + COALESCE(a.vid_count,0) * 0.5)::numeric
    , 1) AS total_points,
    COALESCE(a.days_active, 0)::int AS days_active,
    COALESCE(a.f14_quiz, 0) * 1 AS first_14_days,
    COALESCE(a.f14_refl, 0) * 0.5 AS first_14_reflections,
    COALESCE(a.f60_quiz, 0) * 1 AS first_60_days,
    COALESCE(a.f60_refl, 0) * 0.5 AS first_60_reflections,
    COALESCE(a.asg_count, 0) * 5 AS assignments,
    COALESCE(a.qb_count, 0) * 0.5 AS question_bank,
    COALESCE(a.pq_count, 0) * 1 AS product_quizzes,
    COALESCE(a.vid_count, 0) * 0.5 AS videos
  FROM assembled a
  WHERE
    -- Ghost-account filter: must have either a real identity OR some activity
    (
      NULLIF(TRIM(a.display_name), '') IS NOT NULL
      OR NULLIF(TRIM(a.first_name), '') IS NOT NULL
      OR NULLIF(TRIM(a.last_name), '') IS NOT NULL
      OR NULLIF(TRIM(a.email), '') IS NOT NULL
      OR COALESCE(a.f14_quiz,0) + COALESCE(a.f14_refl,0)
         + COALESCE(a.f60_quiz,0) + COALESCE(a.f60_refl,0)
         + COALESCE(a.asg_count,0) + COALESCE(a.qb_count,0)
         + COALESCE(a.pq_count,0) + COALESCE(a.vid_count,0) > 0
    )
  ORDER BY total_points DESC, days_active DESC, name ASC;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_learner_leaderboard(text) TO authenticated;