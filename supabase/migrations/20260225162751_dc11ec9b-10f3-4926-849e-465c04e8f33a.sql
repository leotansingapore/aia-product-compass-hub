-- Flow annotations table: stores sticky notes, text labels, comments, and drawing paths
CREATE TABLE public.flow_annotations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id uuid NOT NULL REFERENCES public.script_flows(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('sticky', 'text', 'comment', 'drawing')),
  
  -- Position and size (for sticky, text, comment)
  x numeric NOT NULL DEFAULT 0,
  y numeric NOT NULL DEFAULT 0,
  width numeric NOT NULL DEFAULT 200,
  height numeric NOT NULL DEFAULT 150,
  
  -- Content
  content text,
  color text NOT NULL DEFAULT '#fef08a',
  
  -- Drawing-specific: array of path segments (SVG path data)
  drawing_paths jsonb,
  
  -- Comment thread support
  parent_id uuid REFERENCES public.flow_annotations(id) ON DELETE CASCADE,
  resolved boolean NOT NULL DEFAULT false,
  
  -- Author info
  author_name text NOT NULL DEFAULT 'Anonymous',
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Trigger for updated_at
CREATE TRIGGER update_flow_annotations_updated_at
  BEFORE UPDATE ON public.flow_annotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.flow_annotations ENABLE ROW LEVEL SECURITY;

-- Anyone can view annotations on a flow they can view
CREATE POLICY "Anyone can view flow annotations"
  ON public.flow_annotations FOR SELECT
  USING (true);

-- Any authenticated user can create annotations
CREATE POLICY "Authenticated users can insert annotations"
  ON public.flow_annotations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid())::text = user_id);

-- Users can update their own annotations; admins can update any
CREATE POLICY "Users can update own annotations"
  ON public.flow_annotations FOR UPDATE
  USING (
    (auth.uid())::text = user_id
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'master_admin')
  );

-- Users can delete their own annotations; admins can delete any
CREATE POLICY "Users can delete own annotations"
  ON public.flow_annotations FOR DELETE
  USING (
    (auth.uid())::text = user_id
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'master_admin')
  );

-- Index for fast flow lookups
CREATE INDEX idx_flow_annotations_flow_id ON public.flow_annotations(flow_id);
CREATE INDEX idx_flow_annotations_parent_id ON public.flow_annotations(parent_id) WHERE parent_id IS NOT NULL;
