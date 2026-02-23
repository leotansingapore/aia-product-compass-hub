
CREATE TABLE public.script_favourites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  script_id uuid NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, script_id)
);

ALTER TABLE public.script_favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favourites"
  ON public.script_favourites FOR SELECT
  USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can insert their own favourites"
  ON public.script_favourites FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete their own favourites"
  ON public.script_favourites FOR DELETE
  USING ((auth.uid())::text = user_id);
