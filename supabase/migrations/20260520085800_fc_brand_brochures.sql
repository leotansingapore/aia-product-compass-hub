-- FC marketing-kit brochures: AI headshot generation + 1-page brochure storage
-- Backs the "1-Page Leave-Behind Brochure" card in FinancialAdvisorDifferentiation tool.
--
-- Flow:
--   1. FC uploads 3-5 reference photos to `fc-headshots-source` bucket
--   2. FC clicks "Generate headshots" -> insert row into fc_brand_brochures with status='queued'
--   3. Local worker (tools/process_fc_headshot_jobs.py) polls queued rows, runs Higgsfield CLI,
--      uploads outputs to `fc-headshots-generated` bucket, updates status='ready' + URLs
--   4. FC picks a generated headshot, brochure PDF renders client-side and uploads to `fc-brochures`

CREATE TABLE IF NOT EXISTS fc_brand_brochures (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Snapshot of the brand brief at the time of generation so re-renders stay stable
  brand_brief_snapshot      jsonb NOT NULL,

  -- Style cue derived from personality + audience (e.g. "warm-mentor-working-father")
  style_vibe                text,

  -- Source photos uploaded by the FC (paths inside fc-headshots-source bucket)
  headshot_source_paths     text[] NOT NULL DEFAULT '{}',

  -- Generated headshot outputs (4 variants: professional / lifestyle / environmental / hero)
  -- Stored as path inside fc-headshots-generated bucket
  headshot_generated_paths  text[] NOT NULL DEFAULT '{}',

  -- The variant the FC picked for the brochure (path inside fc-headshots-generated)
  headshot_selected_path    text,

  -- Final brochure PDF (path inside fc-brochures bucket)
  brochure_pdf_path         text,

  -- Job lifecycle
  -- queued    -> waiting for the local worker
  -- generating-> worker is calling Higgsfield
  -- ready     -> headshots generated, awaiting FC selection
  -- rendered  -> brochure PDF produced
  -- failed    -> see headshot_error
  status                    text NOT NULL DEFAULT 'queued'
                            CHECK (status IN ('queued','generating','ready','rendered','failed')),
  headshot_error            text,

  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  generated_at              timestamptz,
  rendered_at               timestamptz
);

CREATE INDEX IF NOT EXISTS idx_fc_brand_brochures_user_created
  ON fc_brand_brochures(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fc_brand_brochures_status
  ON fc_brand_brochures(status) WHERE status IN ('queued','generating');

ALTER TABLE fc_brand_brochures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fc_brand_brochures_select_own"
  ON fc_brand_brochures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "fc_brand_brochures_insert_own"
  ON fc_brand_brochures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fc_brand_brochures_update_own"
  ON fc_brand_brochures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "fc_brand_brochures_delete_own"
  ON fc_brand_brochures FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read any row for support and content-quality dashboards.
CREATE POLICY "fc_brand_brochures_select_admin"
  ON fc_brand_brochures FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- The local headshot processor connects with the service-role key so it
-- can flip rows from queued -> generating -> ready without an end-user JWT.
-- Service-role bypasses RLS by default, so no extra policy is needed.

-- Auto-touch updated_at on every UPDATE
CREATE TRIGGER trg_fc_brand_brochures_updated_at
  BEFORE UPDATE ON fc_brand_brochures
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- Storage buckets
-- =============================================================================

-- 1. Source photos (uploaded by FC) — private, owner only
INSERT INTO storage.buckets (id, name, public)
VALUES ('fc-headshots-source', 'fc-headshots-source', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Generated headshots (Higgsfield output) — private, owner only.
-- Kept private so we don't accidentally expose someone's likeness on the public web.
INSERT INTO storage.buckets (id, name, public)
VALUES ('fc-headshots-generated', 'fc-headshots-generated', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Final brochure PDFs — private, owner only. Sharing happens via signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('fc-brochures', 'fc-brochures', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Storage RLS — owner can only read/write their own folder (named by user_id)
-- =============================================================================

CREATE POLICY "fc_headshots_source_owner_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'fc-headshots-source'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "fc_headshots_source_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fc-headshots-source'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "fc_headshots_source_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fc-headshots-source'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "fc_headshots_generated_owner_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'fc-headshots-generated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Generated bucket is written by the service-role worker, not the user,
-- so we don't grant INSERT/UPDATE/DELETE to authenticated users here.
-- Service role bypasses RLS.

CREATE POLICY "fc_brochures_owner_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'fc-brochures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "fc_brochures_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fc-brochures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "fc_brochures_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fc-brochures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
