
CREATE TABLE public.learning_track_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.learning_track_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own overrides"
  ON public.learning_track_overrides FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own overrides"
  ON public.learning_track_overrides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own overrides"
  ON public.learning_track_overrides FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own overrides"
  ON public.learning_track_overrides FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
