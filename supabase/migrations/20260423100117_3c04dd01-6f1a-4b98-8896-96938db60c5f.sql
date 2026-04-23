-- Per-slide submission row. One slide = at most one row per user.
CREATE TABLE public.user_slide_submissions (
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slide_id       text NOT NULL,
  answer_text    text,
  screenshot_url text,
  submitted_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, slide_id)
);
CREATE INDEX idx_user_slide_submissions_user ON public.user_slide_submissions(user_id);

ALTER TABLE public.user_slide_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_slide_submissions_select_own"
  ON public.user_slide_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_slide_submissions_insert_own"
  ON public.user_slide_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_slide_submissions_update_own"
  ON public.user_slide_submissions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_slide_submissions_delete_own"
  ON public.user_slide_submissions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "user_slide_submissions_select_admin"
  ON public.user_slide_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- Private storage bucket for verification screenshots.
INSERT INTO storage.buckets (id, name, public)
VALUES ('checklist-screenshots', 'checklist-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Learners read/write only inside their own <user_id>/ folder.
CREATE POLICY "checklist_screenshots_owner_all"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'checklist-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'checklist-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins read any screenshot (admin dashboard, shipping later).
CREATE POLICY "checklist_screenshots_admin_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'checklist-screenshots'
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'))
  );