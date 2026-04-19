-- Table 1: first_60_days_day_meta
CREATE TABLE public.first_60_days_day_meta (
  day_number int PRIMARY KEY CHECK (day_number BETWEEN 1 AND 60),
  slides_url text,
  video_url text,
  video_duration_sec int,
  published boolean NOT NULL DEFAULT true,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.first_60_days_day_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "first_60_days_day_meta_select_public"
  ON public.first_60_days_day_meta
  FOR SELECT
  TO authenticated
  USING (
    published = true
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master_admin')
  );

CREATE POLICY "first_60_days_day_meta_insert_admin"
  ON public.first_60_days_day_meta
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master_admin')
  );

CREATE POLICY "first_60_days_day_meta_update_admin"
  ON public.first_60_days_day_meta
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master_admin')
  );

CREATE POLICY "first_60_days_day_meta_delete_admin"
  ON public.first_60_days_day_meta
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master_admin')
  );

-- Seed 60 rows
INSERT INTO public.first_60_days_day_meta (day_number)
SELECT generate_series(1, 60);

-- Table 2: first_60_days_progress
CREATE TABLE public.first_60_days_progress (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_number int NOT NULL CHECK (day_number BETWEEN 1 AND 60),
  read_at timestamptz,
  slides_viewed_at timestamptz,
  video_watched_at timestamptz,
  quiz_score int,
  quiz_attempts int NOT NULL DEFAULT 0,
  quiz_passed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day_number)
);

CREATE INDEX idx_first_60_days_progress_user_updated
  ON public.first_60_days_progress (user_id, updated_at DESC);

ALTER TABLE public.first_60_days_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "first_60_days_progress_owner_select"
  ON public.first_60_days_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "first_60_days_progress_owner_insert"
  ON public.first_60_days_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "first_60_days_progress_owner_update"
  ON public.first_60_days_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "first_60_days_progress_owner_delete"
  ON public.first_60_days_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at trigger for both tables
CREATE TRIGGER trg_first_60_days_day_meta_updated_at
  BEFORE UPDATE ON public.first_60_days_day_meta
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_first_60_days_progress_updated_at
  BEFORE UPDATE ON public.first_60_days_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();