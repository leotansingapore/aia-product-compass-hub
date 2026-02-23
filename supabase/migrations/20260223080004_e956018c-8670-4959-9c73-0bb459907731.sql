
CREATE TABLE public.contribution_kudos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  contribution_id uuid NOT NULL REFERENCES public.script_user_versions(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, contribution_id)
);

ALTER TABLE public.contribution_kudos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all kudos"
  ON public.contribution_kudos FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own kudos"
  ON public.contribution_kudos FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own kudos"
  ON public.contribution_kudos FOR DELETE
  USING ((auth.uid())::text = user_id);
