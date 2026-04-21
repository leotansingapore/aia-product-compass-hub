
-- =========================================================
-- 1) Relax learning_track_activity_log for service-role writes
-- =========================================================

-- Make user_id nullable; keep FK to auth.users with ON DELETE SET NULL
ALTER TABLE public.learning_track_activity_log
  ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing FK if present and re-add with ON DELETE SET NULL
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.learning_track_activity_log'::regclass
    AND contype = 'f'
    AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = 'public.learning_track_activity_log'::regclass AND attname = 'user_id')];
  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.learning_track_activity_log DROP CONSTRAINT %I', fk_name);
  END IF;
END$$;

ALTER TABLE public.learning_track_activity_log
  ADD CONSTRAINT learning_track_activity_log_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add action_source if missing
ALTER TABLE public.learning_track_activity_log
  ADD COLUMN IF NOT EXISTS action_source text NOT NULL DEFAULT 'user';

-- Update audit trigger functions: when auth.uid() is NULL, log as service_role
CREATE OR REPLACE FUNCTION public.lt_items_audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_action text;
  v_user_id uuid;
  v_source text;
  v_diff jsonb;
  v_track text;
BEGIN
  v_user_id := auth.uid();
  v_source := CASE WHEN v_user_id IS NULL THEN 'service_role' ELSE 'user' END;

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    SELECT ph.track INTO v_track FROM public.learning_track_phases ph WHERE ph.id = NEW.phase_id;
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track, action_source)
    VALUES (v_user_id, 'item', NEW.id, v_action, jsonb_build_object('after', to_jsonb(NEW)), v_track, v_source);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    SELECT ph.track INTO v_track FROM public.learning_track_phases ph WHERE ph.id = NEW.phase_id;
    v_diff := jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW));

    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track, action_source)
    VALUES (v_user_id, 'item', NEW.id, v_action, v_diff, v_track, v_source);

    INSERT INTO public.learning_track_item_revisions (item_id, snapshot, changed_by)
    VALUES (OLD.id, public.lt_build_item_snapshot(OLD.id), v_user_id);

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    SELECT ph.track INTO v_track FROM public.learning_track_phases ph WHERE ph.id = OLD.phase_id;
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track, action_source)
    VALUES (v_user_id, 'item', OLD.id, v_action, jsonb_build_object('before', to_jsonb(OLD)), v_track, v_source);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.lt_content_blocks_audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_action text;
  v_user_id uuid;
  v_source text;
  v_diff jsonb;
  v_track text;
  v_item_id uuid;
BEGIN
  v_user_id := auth.uid();
  v_source := CASE WHEN v_user_id IS NULL THEN 'service_role' ELSE 'user' END;
  v_item_id := COALESCE(NEW.item_id, OLD.item_id);

  SELECT ph.track INTO v_track
  FROM public.learning_track_items lti
  JOIN public.learning_track_phases ph ON ph.id = lti.phase_id
  WHERE lti.id = v_item_id;

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track, action_source)
    VALUES (v_user_id, 'content_block', NEW.id, v_action, jsonb_build_object('after', to_jsonb(NEW)), v_track, v_source);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_diff := jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW));
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track, action_source)
    VALUES (v_user_id, 'content_block', NEW.id, v_action, v_diff, v_track, v_source);
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track, action_source)
    VALUES (v_user_id, 'content_block', OLD.id, v_action, jsonb_build_object('before', to_jsonb(OLD)), v_track, v_source);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$function$;

-- =========================================================
-- 2a) Delete Pre-RNF "Phase 1 — Industry Understanding"
-- =========================================================

-- Items FK to phases ON DELETE CASCADE; content_blocks FK to items ON DELETE CASCADE.
-- But to be safe in case cascades aren't on the FKs, delete children first.
DELETE FROM public.learning_track_content_blocks
WHERE item_id IN (
  SELECT id FROM public.learning_track_items
  WHERE phase_id = '89b1bc1e-a416-402d-a860-23d09938b8d2'
);

DELETE FROM public.learning_track_items
WHERE phase_id = '89b1bc1e-a416-402d-a860-23d09938b8d2';

DELETE FROM public.learning_track_phases
WHERE id = '89b1bc1e-a416-402d-a860-23d09938b8d2';

-- =========================================================
-- 2b) Re-pack order_index for remaining Pre-RNF phases AND
--     rename Phase N — X to Assignment N — X (1-based, repacked)
-- =========================================================
-- Use a temp offset to dodge the unique (track, order_index) index during the swap.

WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY order_index) AS new_idx,
         regexp_replace(title, '^[Pp]hase\s*\d+\s*[—-]\s*', '') AS stripped_title
  FROM public.learning_track_phases
  WHERE track = 'pre_rnf'
)
UPDATE public.learning_track_phases p
SET order_index = ranked.new_idx + 1000,
    title = 'Assignment ' || ranked.new_idx || ' — ' || ranked.stripped_title
FROM ranked
WHERE p.id = ranked.id;

-- Now bring order_index back to the proper 1..N range
UPDATE public.learning_track_phases
SET order_index = order_index - 1000
WHERE track = 'pre_rnf' AND order_index > 1000;

-- =========================================================
-- 2c) tier_permissions cleanup
-- =========================================================
DELETE FROM public.tier_permissions
WHERE (tier_level = 'post_rnf' AND resource_id = 'cmfas')
   OR (tier_level = 'papers_taker' AND resource_id = 'roleplay');
