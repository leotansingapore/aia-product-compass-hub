DO $$
DECLARE
  v_pairs jsonb := '[
    ["pro-achiever", "core-pro-achiever"],
    ["pro-lifetime-protector", "core-pro-lifetime-protector"],
    ["platinum-wealth-venture", "core-platinum-wealth-venture"],
    ["healthshield-gold-max", "core-healthshield-gold-max"],
    ["solitaire-pa", "core-solitaire-pa"],
    ["ultimate-critical-cover", "core-ultimate-critical-cover"]
  ]'::jsonb;
  v_legacy_ids text[] := ARRAY[
    'pro-achiever','pro-lifetime-protector','platinum-wealth-venture',
    'healthshield-gold-max','solitaire-pa','ultimate-critical-cover'
  ];
  v_merged int;
  v_deleted int;
  v_updated int;
BEGIN
  -- 1) Merge legacy video_progress onto the core-* twin
  WITH remap AS (
    SELECT (p->>0) AS legacy_id, (p->>1) AS core_id
    FROM jsonb_array_elements(v_pairs) AS p
  ),
  ins AS (
    INSERT INTO public.video_progress (
      user_id, product_id, video_id, completed, watch_time_seconds,
      completion_percentage, completed_at, created_at, updated_at
    )
    SELECT
      vp.user_id,
      r.core_id AS product_id,
      vp.video_id,
      vp.completed,
      vp.watch_time_seconds,
      vp.completion_percentage,
      vp.completed_at,
      COALESCE(vp.created_at, now()),
      now()
    FROM public.video_progress vp
    JOIN remap r ON r.legacy_id = vp.product_id
    ON CONFLICT (user_id, product_id, video_id) DO UPDATE
    SET
      completed = public.video_progress.completed OR EXCLUDED.completed,
      watch_time_seconds = GREATEST(
        COALESCE(public.video_progress.watch_time_seconds, 0),
        COALESCE(EXCLUDED.watch_time_seconds, 0)
      ),
      completion_percentage = GREATEST(
        COALESCE(public.video_progress.completion_percentage, 0),
        COALESCE(EXCLUDED.completion_percentage, 0)
      ),
      completed_at = COALESCE(
        LEAST(public.video_progress.completed_at, EXCLUDED.completed_at),
        public.video_progress.completed_at,
        EXCLUDED.completed_at
      ),
      updated_at = now()
    RETURNING 1
  )
  SELECT count(*) INTO v_merged FROM ins;

  -- 2) Delete the now-migrated legacy rows
  WITH del AS (
    DELETE FROM public.video_progress
    WHERE product_id = ANY(v_legacy_ids)
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM del;

  -- 3) Hide the legacy duplicate products from learner navigation
  WITH upd AS (
    UPDATE public.products
    SET published = false, updated_at = now()
    WHERE id = ANY(v_legacy_ids)
    RETURNING 1
  )
  SELECT count(*) INTO v_updated FROM upd;

  RAISE NOTICE 'video_progress merged: %, deleted: %, products unpublished: %',
    v_merged, v_deleted, v_updated;
END $$;