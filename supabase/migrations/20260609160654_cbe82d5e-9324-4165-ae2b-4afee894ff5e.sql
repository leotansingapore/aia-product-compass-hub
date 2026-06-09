
-- 1. social_content_drafts
CREATE TABLE IF NOT EXISTS public.social_content_drafts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar          text NOT NULL CHECK (pillar IN ('interest', 'identity', 'topic', 'market')),
  pillar_detail   text NOT NULL,
  idea_source     text NOT NULL,
  idea_context    text,
  platform        text NOT NULL CHECK (platform IN ('linkedin', 'instagram', 'facebook', 'tiktok')),
  format          text NOT NULL CHECK (format IN ('carousel', 'short-video', 'text-post', 'story')),
  cta_type        text NOT NULL CHECK (cta_type IN ('dm-keyword', 'comment-keyword', 'save-share', 'book-call', 'open-question')),
  draft_text      text NOT NULL,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_content_drafts TO authenticated;
GRANT ALL ON public.social_content_drafts TO service_role;
ALTER TABLE public.social_content_drafts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_social_content_drafts_user_created ON public.social_content_drafts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_content_drafts_user_status ON public.social_content_drafts(user_id, status);
DROP POLICY IF EXISTS "social_content_drafts_select_own" ON public.social_content_drafts;
CREATE POLICY "social_content_drafts_select_own" ON public.social_content_drafts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "social_content_drafts_insert_own" ON public.social_content_drafts;
CREATE POLICY "social_content_drafts_insert_own" ON public.social_content_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "social_content_drafts_update_own" ON public.social_content_drafts;
CREATE POLICY "social_content_drafts_update_own" ON public.social_content_drafts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "social_content_drafts_delete_own" ON public.social_content_drafts;
CREATE POLICY "social_content_drafts_delete_own" ON public.social_content_drafts FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "social_content_drafts_select_admin" ON public.social_content_drafts;
CREATE POLICY "social_content_drafts_select_admin" ON public.social_content_drafts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));
DROP TRIGGER IF EXISTS trg_social_content_drafts_updated_at ON public.social_content_drafts;
CREATE TRIGGER trg_social_content_drafts_updated_at
  BEFORE UPDATE ON public.social_content_drafts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. video_progress: per-lesson action-step completions
ALTER TABLE public.video_progress
  ADD COLUMN IF NOT EXISTS completed_action_step_ids text[] NOT NULL DEFAULT '{}';

-- 3. content_studio_drafts (standalone app)
CREATE TABLE IF NOT EXISTS public.content_studio_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hook text,
  draft text NOT NULL,
  pillar text,
  pillar_detail text,
  audience text,
  format text,
  platform text,
  cta_type text,
  vibe_source_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_studio_drafts TO authenticated;
GRANT ALL ON public.content_studio_drafts TO service_role;
ALTER TABLE public.content_studio_drafts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS content_studio_drafts_user_idx ON public.content_studio_drafts (user_id, created_at DESC);
DROP POLICY IF EXISTS "content_studio_drafts_manage_own" ON public.content_studio_drafts;
CREATE POLICY "content_studio_drafts_manage_own" ON public.content_studio_drafts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. content_studio_voice_profiles (standalone app)
CREATE TABLE IF NOT EXISTS public.content_studio_voice_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  past_posts jsonb NOT NULL DEFAULT '[]'::jsonb,
  voice_summary text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_studio_voice_profiles TO authenticated;
GRANT ALL ON public.content_studio_voice_profiles TO service_role;
ALTER TABLE public.content_studio_voice_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "content_studio_voice_profiles_manage_own" ON public.content_studio_voice_profiles;
CREATE POLICY "content_studio_voice_profiles_manage_own" ON public.content_studio_voice_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS trg_content_studio_voice_profiles_updated_at ON public.content_studio_voice_profiles;
CREATE TRIGGER trg_content_studio_voice_profiles_updated_at
  BEFORE UPDATE ON public.content_studio_voice_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
