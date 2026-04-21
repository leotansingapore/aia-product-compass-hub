CREATE TABLE public.first_14_days_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 14),
  read_at TIMESTAMPTZ,
  quiz_score INTEGER,
  quiz_attempts INTEGER NOT NULL DEFAULT 0,
  quiz_passed_at TIMESTAMPTZ,
  reflection_answers JSONB,
  reflection_saved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, day_number)
);

ALTER TABLE public.first_14_days_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "first_14_days_progress_select_own"
  ON public.first_14_days_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "first_14_days_progress_insert_own"
  ON public.first_14_days_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "first_14_days_progress_update_own"
  ON public.first_14_days_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "first_14_days_progress_delete_own"
  ON public.first_14_days_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "first_14_days_progress_select_admin"
  ON public.first_14_days_progress FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master_admin')
  );

CREATE OR REPLACE FUNCTION public.set_first_14_days_progress_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER first_14_days_progress_set_updated_at
  BEFORE UPDATE ON public.first_14_days_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_first_14_days_progress_updated_at();