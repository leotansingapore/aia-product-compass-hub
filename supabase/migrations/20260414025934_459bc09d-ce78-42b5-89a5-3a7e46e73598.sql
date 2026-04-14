
-- =============================================
-- 1. NEW TABLES
-- =============================================

-- learning_track_templates
CREATE TABLE public.learning_track_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  hint text,
  category text NOT NULL CHECK (category IN ('General','Lesson','Practice','Assessment')),
  title text NOT NULL,
  description text,
  objectives text[],
  action_items text[],
  requires_submission boolean NOT NULL DEFAULT false,
  content_blocks jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_track_templates ENABLE ROW LEVEL SECURITY;

-- learning_track_item_revisions
CREATE TABLE public.learning_track_item_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.learning_track_items(id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  change_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lt_item_revisions_item_created
  ON public.learning_track_item_revisions (item_id, created_at DESC);

ALTER TABLE public.learning_track_item_revisions ENABLE ROW LEVEL SECURITY;

-- learning_track_activity_log
CREATE TABLE public.learning_track_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  entity_type text NOT NULL CHECK (entity_type IN ('phase','item','content_block','submission')),
  entity_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('create','update','delete','duplicate','import')),
  diff jsonb,
  track text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lt_activity_log_created ON public.learning_track_activity_log (created_at DESC);
CREATE INDEX idx_lt_activity_log_entity ON public.learning_track_activity_log (entity_type, entity_id);
CREATE INDEX idx_lt_activity_log_user ON public.learning_track_activity_log (user_id, created_at DESC);

ALTER TABLE public.learning_track_activity_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. COLUMN ADDITIONS
-- =============================================

ALTER TABLE public.learning_track_phases
  ADD COLUMN published_at timestamptz;

ALTER TABLE public.learning_track_items
  ADD COLUMN published_at timestamptz;

-- =============================================
-- 3. ENUM EXPANSION — block_type check constraint
-- =============================================

-- Drop old check constraint (name may vary; try the convention Supabase uses)
ALTER TABLE public.learning_track_content_blocks
  DROP CONSTRAINT IF EXISTS learning_track_content_blocks_block_type_check;

ALTER TABLE public.learning_track_content_blocks
  ADD CONSTRAINT learning_track_content_blocks_block_type_check
  CHECK (block_type IN ('text','link','video','resource_ref','image'));

-- =============================================
-- 4. RLS POLICIES
-- =============================================

-- Helper: check admin via user_admin_roles
-- (reuses existing has_role function which checks user_admin_roles)

-- learning_track_templates
CREATE POLICY "lt_templates_select_authenticated"
  ON public.learning_track_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "lt_templates_admin_insert"
  ON public.learning_track_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles
      WHERE user_id = auth.uid()::text
        AND admin_role IN ('admin','master_admin')
    )
  );

CREATE POLICY "lt_templates_admin_update"
  ON public.learning_track_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles
      WHERE user_id = auth.uid()::text
        AND admin_role IN ('admin','master_admin')
    )
  );

CREATE POLICY "lt_templates_admin_delete"
  ON public.learning_track_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles
      WHERE user_id = auth.uid()::text
        AND admin_role IN ('admin','master_admin')
    )
  );

-- learning_track_item_revisions (immutable: SELECT + INSERT only)
CREATE POLICY "lt_revisions_admin_select"
  ON public.learning_track_item_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles
      WHERE user_id = auth.uid()::text
        AND admin_role IN ('admin','master_admin')
    )
  );

CREATE POLICY "lt_revisions_admin_insert"
  ON public.learning_track_item_revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles
      WHERE user_id = auth.uid()::text
        AND admin_role IN ('admin','master_admin')
    )
  );

-- learning_track_activity_log (SELECT for admins; INSERT via triggers/service role only)
CREATE POLICY "lt_activity_log_admin_select"
  ON public.learning_track_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles
      WHERE user_id = auth.uid()::text
        AND admin_role IN ('admin','master_admin')
    )
  );

-- INSERT policy for service_role context (triggers run as table owner)
CREATE POLICY "lt_activity_log_service_insert"
  ON public.learning_track_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- 5. TRIGGERS & HELPER FUNCTIONS
-- =============================================

-- Helper: build item snapshot (item row + its content_blocks as JSON array)
CREATE OR REPLACE FUNCTION public.lt_build_item_snapshot(p_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item jsonb;
  v_blocks jsonb;
BEGIN
  SELECT to_jsonb(i.*) INTO v_item
  FROM public.learning_track_items i
  WHERE i.id = p_item_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(cb.*) ORDER BY cb.order_index), '[]'::jsonb)
  INTO v_blocks
  FROM public.learning_track_content_blocks cb
  WHERE cb.item_id = p_item_id;

  RETURN v_item || jsonb_build_object('content_blocks', v_blocks);
END;
$$;

-- Trigger function for learning_track_items
CREATE OR REPLACE FUNCTION public.lt_items_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_user_id uuid;
  v_diff jsonb;
  v_track text;
BEGIN
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    -- Resolve track from phase
    SELECT ph.track INTO v_track FROM public.learning_track_phases ph WHERE ph.id = NEW.phase_id;
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track)
    VALUES (v_user_id, 'item', NEW.id, v_action, jsonb_build_object('after', to_jsonb(NEW)), v_track);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    SELECT ph.track INTO v_track FROM public.learning_track_phases ph WHERE ph.id = NEW.phase_id;
    v_diff := jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW));

    -- Write activity log
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track)
    VALUES (v_user_id, 'item', NEW.id, v_action, v_diff, v_track);

    -- Write revision snapshot (previous state)
    INSERT INTO public.learning_track_item_revisions (item_id, snapshot, changed_by)
    VALUES (OLD.id, public.lt_build_item_snapshot(OLD.id), v_user_id);

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    SELECT ph.track INTO v_track FROM public.learning_track_phases ph WHERE ph.id = OLD.phase_id;
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track)
    VALUES (v_user_id, 'item', OLD.id, v_action, jsonb_build_object('before', to_jsonb(OLD)), v_track);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER lt_items_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.learning_track_items
  FOR EACH ROW EXECUTE FUNCTION public.lt_items_audit_trigger();

-- Trigger function for learning_track_content_blocks
CREATE OR REPLACE FUNCTION public.lt_content_blocks_audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_user_id uuid;
  v_diff jsonb;
  v_track text;
  v_item_id uuid;
BEGIN
  v_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  v_item_id := COALESCE(NEW.item_id, OLD.item_id);

  -- Resolve track
  SELECT ph.track INTO v_track
  FROM public.learning_track_items lti
  JOIN public.learning_track_phases ph ON ph.id = lti.phase_id
  WHERE lti.id = v_item_id;

  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track)
    VALUES (v_user_id, 'content_block', NEW.id, v_action, jsonb_build_object('after', to_jsonb(NEW)), v_track);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_diff := jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW));
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track)
    VALUES (v_user_id, 'content_block', NEW.id, v_action, v_diff, v_track);
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    INSERT INTO public.learning_track_activity_log (user_id, entity_type, entity_id, action, diff, track)
    VALUES (v_user_id, 'content_block', OLD.id, v_action, jsonb_build_object('before', to_jsonb(OLD)), v_track);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER lt_content_blocks_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.learning_track_content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.lt_content_blocks_audit_trigger();

-- Updated_at trigger for templates
CREATE TRIGGER update_lt_templates_updated_at
  BEFORE UPDATE ON public.learning_track_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
