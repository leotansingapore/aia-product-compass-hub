CREATE OR REPLACE FUNCTION public.get_learner_leaderboard(p_tier text)
 RETURNS TABLE(user_id uuid, name text, email text, total_points numeric, days_active integer, first_14_days numeric, first_60_days numeric, assignments numeric, question_bank numeric, videos numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
#variable_conflict use_column
DECLARE
  v_caller uuid := auth.uid();
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
  asg AS (
    SELECT user_id, COUNT(DISTINCT item_id)::numeric AS asg_count
    FROM public.assignment_submissions
    WHERE product_id = 'first-60-days-assignments' GROUP BY user_id
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
      SELECT user_id, DATE(quiz_passed_at) AS activity_day FROM public.first_14_days_progress WHERE quiz_passed_at IS NOT NULL
      UNION SELECT user_id, DATE(updated_at) FROM public.first_14_days_progress WHERE updated_at IS NOT NULL
      UNION SELECT user_id, DATE(quiz_passed_at) FROM public.first_60_days_progress WHERE quiz_passed_at IS NOT NULL
      UNION SELECT user_id, DATE(updated_at) FROM public.first_60_days_progress WHERE updated_at IS NOT NULL
      UNION SELECT user_id, DATE(COALESCE(submitted_at, created_at)) FROM public.assignment_submissions
        WHERE product_id = 'first-60-days-assignments' AND COALESCE(submitted_at, created_at) IS NOT NULL
      UNION SELECT user_id::uuid, DATE(last_answered_at) FROM public.user_question_progress
        WHERE total_correct > 0 AND last_answered_at IS NOT NULL
      UNION SELECT vp.user_id, DATE(COALESCE(vp.completed_at, vp.updated_at))
        FROM public.video_progress vp
        JOIN public.products pr ON pr.id = vp.product_id
        JOIN public.categories c ON c.id = pr.category_id
        WHERE vp.completed = true AND c.name = 'Core Products'
          AND COALESCE(vp.completed_at, vp.updated_at) IS NOT NULL
    ) src GROUP BY src.user_id
  ),
  assembled AS (
    SELECT
      vu.user_id,
      vu.display_name, vu.first_name, vu.last_name, vu.email,
      COALESCE(f14.f14_quiz, 0) AS f14_quiz,
      COALESCE(f60.f60_quiz, 0) AS f60_quiz,
      COALESCE(asg.asg_count, 0) AS asg_count,
      COALESCE(qb.qb_count, 0)  AS qb_count,
      COALESCE(vid.vid_count, 0) AS vid_count,
      COALESCE(days.days_active, 0) AS days_active
    FROM visible_users vu
    LEFT JOIN f14 ON f14.user_id = vu.user_id
    LEFT JOIN f60 ON f60.user_id = vu.user_id
    LEFT JOIN asg ON asg.user_id = vu.user_id
    LEFT JOIN qb  ON qb.user_id  = vu.user_id
    LEFT JOIN vid ON vid.user_id = vu.user_id
    LEFT JOIN days ON days.user_id = vu.user_id
  ),
  scored AS (
    SELECT
      a.user_id,
      COALESCE(NULLIF(TRIM(a.display_name), ''),
               NULLIF(TRIM(CONCAT_WS(' ', a.first_name, a.last_name)), ''),
               SPLIT_PART(COALESCE(a.email, ''), '@', 1),
               'Anonymous') AS name,
      a.email,
      (a.f14_quiz * 5) + (a.f60_quiz * 5) + (a.asg_count * 50)
        + (a.qb_count * 0.2) + (a.vid_count * 2.5) AS total_points,
      a.days_active,
      a.f14_quiz * 5 AS first_14_days,
      a.f60_quiz * 5 AS first_60_days,
      a.asg_count * 50 AS assignments,
      a.qb_count * 0.2 AS question_bank,
      a.vid_count * 2.5 AS videos
    FROM assembled a
    WHERE COALESCE(NULLIF(TRIM(a.display_name), ''),
                   NULLIF(TRIM(CONCAT_WS(' ', a.first_name, a.last_name)), ''),
                   NULLIF(a.email, '')) IS NOT NULL
  )
  SELECT s.user_id, s.name, s.email, s.total_points, s.days_active,
    s.first_14_days, s.first_60_days, s.assignments, s.question_bank, s.videos
  FROM scored s
  ORDER BY s.total_points DESC, s.days_active DESC, s.name ASC;
END;
$function$;