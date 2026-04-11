
-- ============================================================
-- Learning Track Overhaul Migration
-- ============================================================

-- 1. TABLES (with IF NOT EXISTS in case partial apply)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.learning_track_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track text NOT NULL CHECK (track IN ('pre_rnf','post_rnf')),
  order_index int NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lt_phases_track_order ON public.learning_track_phases (track, order_index);

CREATE TABLE IF NOT EXISTS public.learning_track_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id uuid NOT NULL REFERENCES public.learning_track_phases(id) ON DELETE CASCADE,
  order_index int NOT NULL,
  title text NOT NULL,
  description text,
  objectives text[],
  action_items text[],
  requires_submission boolean NOT NULL DEFAULT true,
  legacy_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lt_items_phase_order ON public.learning_track_items (phase_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lt_items_legacy_id ON public.learning_track_items (legacy_id);

CREATE TABLE IF NOT EXISTS public.learning_track_content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.learning_track_items(id) ON DELETE CASCADE,
  order_index int NOT NULL,
  block_type text NOT NULL CHECK (block_type IN ('text','link','video','resource_ref')),
  title text,
  body text,
  url text,
  resource_type text CHECK (resource_type IS NULL OR resource_type IN ('product','kb','script','concept_card','video','obsidian_doc','notebooklm')),
  resource_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lt_content_blocks_item ON public.learning_track_content_blocks (item_id);

CREATE TABLE IF NOT EXISTS public.learning_track_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.learning_track_items(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lt_progress_user_item ON public.learning_track_progress (user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_lt_progress_user ON public.learning_track_progress (user_id);

CREATE TABLE IF NOT EXISTS public.learning_track_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.learning_track_items(id) ON DELETE CASCADE,
  remarks text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','changes_requested')),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_feedback text
);
CREATE INDEX IF NOT EXISTS idx_lt_submissions_user_item ON public.learning_track_submissions (user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_lt_submissions_review_status ON public.learning_track_submissions (review_status);

CREATE TABLE IF NOT EXISTS public.learning_track_submission_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.learning_track_submissions(id) ON DELETE CASCADE,
  file_type text NOT NULL CHECK (file_type IN ('pdf','image','url','loom','text')),
  label text,
  storage_path text,
  external_url text,
  content_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lt_submission_files_sub ON public.learning_track_submission_files (submission_id);

CREATE TABLE IF NOT EXISTS public.obsidian_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('reference','training_guide','product_moc','learning_moc','other')),
  title text NOT NULL,
  body_md text NOT NULL,
  frontmatter jsonb,
  synced_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_obsidian_resources_category ON public.obsidian_resources (category);

-- 2. UPDATED_AT TRIGGERS
DROP TRIGGER IF EXISTS update_lt_phases_updated_at ON public.learning_track_phases;
CREATE TRIGGER update_lt_phases_updated_at BEFORE UPDATE ON public.learning_track_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lt_items_updated_at ON public.learning_track_items;
CREATE TRIGGER update_lt_items_updated_at BEFORE UPDATE ON public.learning_track_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lt_progress_updated_at ON public.learning_track_progress;
CREATE TRIGGER update_lt_progress_updated_at BEFORE UPDATE ON public.learning_track_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. ENABLE RLS
ALTER TABLE public.learning_track_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_track_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_track_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_track_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_track_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_track_submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obsidian_resources ENABLE ROW LEVEL SECURITY;

-- 4. RLS — Content tables
DROP POLICY IF EXISTS "lt_content_select_authenticated" ON public.learning_track_phases;
CREATE POLICY "lt_content_select_authenticated" ON public.learning_track_phases
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "lt_content_admin_insert" ON public.learning_track_phases;
CREATE POLICY "lt_content_admin_insert" ON public.learning_track_phases
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP POLICY IF EXISTS "lt_content_admin_update" ON public.learning_track_phases;
CREATE POLICY "lt_content_admin_update" ON public.learning_track_phases
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP POLICY IF EXISTS "lt_content_admin_delete" ON public.learning_track_phases;
CREATE POLICY "lt_content_admin_delete" ON public.learning_track_phases
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

DROP POLICY IF EXISTS "lt_items_select_authenticated" ON public.learning_track_items;
CREATE POLICY "lt_items_select_authenticated" ON public.learning_track_items
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "lt_items_admin_insert" ON public.learning_track_items;
CREATE POLICY "lt_items_admin_insert" ON public.learning_track_items
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP POLICY IF EXISTS "lt_items_admin_update" ON public.learning_track_items;
CREATE POLICY "lt_items_admin_update" ON public.learning_track_items
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP POLICY IF EXISTS "lt_items_admin_delete" ON public.learning_track_items;
CREATE POLICY "lt_items_admin_delete" ON public.learning_track_items
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

DROP POLICY IF EXISTS "lt_blocks_select_authenticated" ON public.learning_track_content_blocks;
CREATE POLICY "lt_blocks_select_authenticated" ON public.learning_track_content_blocks
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "lt_blocks_admin_insert" ON public.learning_track_content_blocks;
CREATE POLICY "lt_blocks_admin_insert" ON public.learning_track_content_blocks
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP POLICY IF EXISTS "lt_blocks_admin_update" ON public.learning_track_content_blocks;
CREATE POLICY "lt_blocks_admin_update" ON public.learning_track_content_blocks
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP POLICY IF EXISTS "lt_blocks_admin_delete" ON public.learning_track_content_blocks;
CREATE POLICY "lt_blocks_admin_delete" ON public.learning_track_content_blocks
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

DROP POLICY IF EXISTS "lt_obsidian_select_authenticated" ON public.obsidian_resources;
CREATE POLICY "lt_obsidian_select_authenticated" ON public.obsidian_resources
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "lt_obsidian_admin_insert" ON public.obsidian_resources;
CREATE POLICY "lt_obsidian_admin_insert" ON public.obsidian_resources
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP POLICY IF EXISTS "lt_obsidian_admin_update" ON public.obsidian_resources;
CREATE POLICY "lt_obsidian_admin_update" ON public.obsidian_resources
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP POLICY IF EXISTS "lt_obsidian_admin_delete" ON public.obsidian_resources;
CREATE POLICY "lt_obsidian_admin_delete" ON public.obsidian_resources
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- 5. RLS — learning_track_progress
DROP POLICY IF EXISTS "lt_progress_user_select_own" ON public.learning_track_progress;
CREATE POLICY "lt_progress_user_select_own" ON public.learning_track_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "lt_progress_user_insert_own" ON public.learning_track_progress;
CREATE POLICY "lt_progress_user_insert_own" ON public.learning_track_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "lt_progress_user_update_own" ON public.learning_track_progress;
CREATE POLICY "lt_progress_user_update_own" ON public.learning_track_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "lt_progress_admin_select_all" ON public.learning_track_progress;
CREATE POLICY "lt_progress_admin_select_all" ON public.learning_track_progress
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- 6. RLS — learning_track_submissions
DROP POLICY IF EXISTS "lt_submissions_user_select_own" ON public.learning_track_submissions;
CREATE POLICY "lt_submissions_user_select_own" ON public.learning_track_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "lt_submissions_user_insert_own" ON public.learning_track_submissions;
CREATE POLICY "lt_submissions_user_insert_own" ON public.learning_track_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "lt_submissions_user_update_own_unreviewed" ON public.learning_track_submissions;
CREATE POLICY "lt_submissions_user_update_own_unreviewed" ON public.learning_track_submissions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id AND review_status = 'pending');
DROP POLICY IF EXISTS "lt_submissions_admin_select_all" ON public.learning_track_submissions;
CREATE POLICY "lt_submissions_admin_select_all" ON public.learning_track_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP POLICY IF EXISTS "lt_submissions_admin_update" ON public.learning_track_submissions;
CREATE POLICY "lt_submissions_admin_update" ON public.learning_track_submissions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- 7. RLS — learning_track_submission_files
DROP POLICY IF EXISTS "lt_files_user_select_own" ON public.learning_track_submission_files;
CREATE POLICY "lt_files_user_select_own" ON public.learning_track_submission_files
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.learning_track_submissions s WHERE s.id = submission_id AND s.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "lt_files_user_insert_own" ON public.learning_track_submission_files;
CREATE POLICY "lt_files_user_insert_own" ON public.learning_track_submission_files
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.learning_track_submissions s WHERE s.id = submission_id AND s.user_id = auth.uid() AND s.review_status = 'pending')
  );
DROP POLICY IF EXISTS "lt_files_user_delete_own" ON public.learning_track_submission_files;
CREATE POLICY "lt_files_user_delete_own" ON public.learning_track_submission_files
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.learning_track_submissions s WHERE s.id = submission_id AND s.user_id = auth.uid() AND s.review_status = 'pending')
  );
DROP POLICY IF EXISTS "lt_files_admin_select_all" ON public.learning_track_submission_files;
CREATE POLICY "lt_files_admin_select_all" ON public.learning_track_submission_files
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- 8. RPC FUNCTIONS (fixed FILTER syntax)

CREATE OR REPLACE FUNCTION public.get_learning_track_roster()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  pre_rnf_progress_pct numeric,
  post_rnf_progress_pct numeric,
  pending_submissions int,
  last_activity timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS user_id,
    COALESCE(p.display_name, p.first_name, 'User')::text AS display_name,
    COALESCE(
      ROUND(100.0 * (COUNT(ltp.id) FILTER (WHERE ltp.status = 'completed' AND ph.track = 'pre_rnf'))
        / NULLIF((COUNT(lti.id) FILTER (WHERE ph.track = 'pre_rnf')), 0), 1),
      0
    ) AS pre_rnf_progress_pct,
    COALESCE(
      ROUND(100.0 * (COUNT(ltp.id) FILTER (WHERE ltp.status = 'completed' AND ph.track = 'post_rnf'))
        / NULLIF((COUNT(lti.id) FILTER (WHERE ph.track = 'post_rnf')), 0), 1),
      0
    ) AS post_rnf_progress_pct,
    COALESCE((
      SELECT COUNT(*)::int FROM learning_track_submissions s2 WHERE s2.user_id = p.id AND s2.review_status = 'pending'
    ), 0) AS pending_submissions,
    (SELECT MAX(ltp2.updated_at) FROM learning_track_progress ltp2 WHERE ltp2.user_id = p.id) AS last_activity
  FROM profiles p
  CROSS JOIN learning_track_items lti
  JOIN learning_track_phases ph ON ph.id = lti.phase_id
  LEFT JOIN learning_track_progress ltp ON ltp.user_id = p.id AND ltp.item_id = lti.id
  GROUP BY p.id, p.display_name, p.first_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_learning_track_heatmap()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  phase_id uuid,
  phase_title text,
  track text,
  completed_count int,
  total_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS user_id,
    COALESCE(p.display_name, p.first_name, 'User')::text AS display_name,
    ph.id AS phase_id,
    ph.title::text AS phase_title,
    ph.track::text AS track,
    (COUNT(ltp.id) FILTER (WHERE ltp.status = 'completed'))::int AS completed_count,
    COUNT(lti.id)::int AS total_count
  FROM profiles p
  CROSS JOIN learning_track_phases ph
  JOIN learning_track_items lti ON lti.phase_id = ph.id
  LEFT JOIN learning_track_progress ltp ON ltp.user_id = p.id AND ltp.item_id = lti.id
  GROUP BY p.id, p.display_name, p.first_name, ph.id, ph.title, ph.track;
END;
$$;

-- 9. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-track-submissions', 'learning-track-submissions', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "lt_storage_user_insert" ON storage.objects;
CREATE POLICY "lt_storage_user_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'learning-track-submissions' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "lt_storage_user_select" ON storage.objects;
CREATE POLICY "lt_storage_user_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'learning-track-submissions' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "lt_storage_admin_select" ON storage.objects;
CREATE POLICY "lt_storage_admin_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'learning-track-submissions' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin')));
