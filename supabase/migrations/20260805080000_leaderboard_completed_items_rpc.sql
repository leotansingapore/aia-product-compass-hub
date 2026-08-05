-- Leaderboard drill-down: list WHAT a learner has completed, not just how many
-- points it adds up to. Consumed by the expanded row on /leaderboard.
--
-- Scope: admins may inspect anyone; a learner may only inspect themself. Peers
-- keep seeing the aggregate point breakdown only — per-item activity with
-- timestamps stays private, consistent with the 2026-08-03 PII lockdown.
--
-- Sources mirror the scoring CTEs in get_learner_leaderboard exactly, so every
-- listed item corresponds to points on the board:
--   first_14_days / first_60_days / next_60_days / product_mastery
--     one row per day whose quiz was passed (item_key = day number)
--   assignments
--     one row per distinct pre-RNF assignment item (latest submission time)
--   videos
--     one row per completed Core Products video (title resolved from the
--     product's training_videos jsonb)
-- The question bank stays aggregate-only on the board — 1,700+ per-question
-- rows are noise, and the breakdown line already shows the count.
CREATE OR REPLACE FUNCTION public.get_learner_completed_items(p_user_id uuid)
 RETURNS TABLE(source text, item_key text, item_label text, completed_on timestamptz)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller uuid := auth.uid();
  v_is_admin boolean;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_is_admin := has_role(v_caller, 'admin') OR has_role(v_caller, 'master_admin');
  IF NOT v_is_admin AND v_caller IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'You can only view your own completed items';
  END IF;

  RETURN QUERY
  SELECT 'first_14_days'::text, p.day_number::text, 'Day ' || p.day_number, p.quiz_passed_at
    FROM public.first_14_days_progress p
   WHERE p.user_id = p_user_id AND p.quiz_passed_at IS NOT NULL

  UNION ALL
  SELECT 'first_60_days'::text, p.day_number::text, 'Day ' || p.day_number, p.quiz_passed_at
    FROM public.first_60_days_progress p
   WHERE p.user_id = p_user_id AND p.quiz_passed_at IS NOT NULL

  UNION ALL
  SELECT 'next_60_days'::text, p.day_number::text, 'Day ' || p.day_number, p.quiz_passed_at
    FROM public.next_60_days_progress p
   WHERE p.user_id = p_user_id AND p.quiz_passed_at IS NOT NULL

  UNION ALL
  SELECT 'product_mastery'::text, p.day_number::text, 'Day ' || p.day_number, p.quiz_passed_at
    FROM public.product_mastery_progress p
   WHERE p.user_id = p_user_id AND p.quiz_passed_at IS NOT NULL

  UNION ALL
  SELECT 'assignments'::text, s.item_id, s.item_id, MAX(s.submitted_at)
    FROM public.assignment_submissions s
   WHERE s.user_id = p_user_id
     AND s.product_id IN ('first-60-days-assignments', 'next-60-days-assignments')
   GROUP BY s.item_id

  UNION ALL
  SELECT 'videos'::text, vp.video_id,
         COALESCE(tv.title, pr.title, vp.video_id),
         COALESCE(vp.completed_at, vp.updated_at)
    FROM public.video_progress vp
    JOIN public.products pr ON pr.id = vp.product_id
    JOIN public.categories c ON c.id = pr.category_id
    LEFT JOIN LATERAL (
      SELECT elem->>'title' AS title
      FROM jsonb_array_elements(
             CASE WHEN jsonb_typeof(pr.training_videos) = 'array'
                  THEN pr.training_videos ELSE '[]'::jsonb END
           ) elem
      WHERE elem->>'id' = vp.video_id
      LIMIT 1
    ) tv ON true
   WHERE vp.user_id = p_user_id AND vp.completed = true AND c.name = 'Core Products'

  ORDER BY 1, 4;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_learner_completed_items(uuid) TO authenticated;
