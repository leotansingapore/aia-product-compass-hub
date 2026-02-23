
-- User-contributed script versions
CREATE TABLE public.script_user_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id uuid NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.script_user_versions ENABLE ROW LEVEL SECURITY;

-- Everyone can view all user versions
CREATE POLICY "Anyone can view user versions" ON public.script_user_versions FOR SELECT USING (true);

-- Authenticated users can create their own versions
CREATE POLICY "Users can create own versions" ON public.script_user_versions FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update only their own versions
CREATE POLICY "Users can update own versions" ON public.script_user_versions FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can delete only their own versions
CREATE POLICY "Users can delete own versions" ON public.script_user_versions FOR DELETE USING (auth.uid()::text = user_id);

-- Admins can manage all
CREATE POLICY "Admins can manage all user versions" ON public.script_user_versions FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Index for fast lookups
CREATE INDEX idx_script_user_versions_script_id ON public.script_user_versions(script_id);
CREATE INDEX idx_script_user_versions_user_id ON public.script_user_versions(user_id);

-- Updated_at trigger
CREATE TRIGGER update_script_user_versions_updated_at
BEFORE UPDATE ON public.script_user_versions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
