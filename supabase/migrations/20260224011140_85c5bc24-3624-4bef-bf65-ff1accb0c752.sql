
-- Analytics table for script duplicate resolution decisions
CREATE TABLE public.script_duplicate_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id text NOT NULL,
  action text NOT NULL, -- 'merge_as_version', 'add_separate', 'override_near_identical'
  similarity_score numeric,
  search_tier text, -- 'tier1', 'tier2'
  category text,
  target_audience text
);

ALTER TABLE public.script_duplicate_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics"
  ON public.script_duplicate_analytics FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Admins can view all analytics"
  ON public.script_duplicate_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE INDEX idx_script_dup_analytics_action ON public.script_duplicate_analytics(action);
CREATE INDEX idx_script_dup_analytics_created ON public.script_duplicate_analytics(created_at);
