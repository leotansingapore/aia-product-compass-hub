DO $$
DECLARE
  v_user_id uuid := '38c43109-3f3f-467b-8cb9-7c8304d61513';
BEGIN
  INSERT INTO public.learning_track_progress (user_id, item_id, status, completed_at)
  SELECT v_user_id, i.id, 'completed', now()
    FROM public.learning_track_items i
    JOIN public.learning_track_phases p ON p.id = i.phase_id
   WHERE p.track IN ('pre_rnf', 'post_rnf')
     AND p.published_at IS NOT NULL
     AND i.published_at IS NOT NULL
  ON CONFLICT (user_id, item_id) DO UPDATE
    SET status       = EXCLUDED.status,
        completed_at = COALESCE(public.learning_track_progress.completed_at, EXCLUDED.completed_at);

  RAISE NOTICE 'Seeded learning_track_progress for avyltest on pre_rnf + post_rnf';
END $$;

-- Verification query (run after the DO block)
SELECT p.track,
       count(*)                                                  AS items_total,
       count(*) FILTER (WHERE prog.status = 'completed')         AS items_completed
  FROM public.learning_track_items i
  JOIN public.learning_track_phases p ON p.id = i.phase_id
  LEFT JOIN public.learning_track_progress prog
         ON prog.item_id = i.id
        AND prog.user_id = '38c43109-3f3f-467b-8cb9-7c8304d61513'
 WHERE p.track IN ('pre_rnf', 'post_rnf')
   AND p.published_at IS NOT NULL
   AND i.published_at IS NOT NULL
 GROUP BY p.track
 ORDER BY p.track;

-- Also verify total profile count for avyltest
SELECT id, user_id, email, created_at
  FROM public.profiles
  WHERE email = 'avyltest@gmail.com';