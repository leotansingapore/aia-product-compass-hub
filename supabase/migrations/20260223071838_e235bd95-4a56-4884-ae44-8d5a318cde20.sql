
-- Script Flows (the flow itself)
CREATE TABLE public.script_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  is_template BOOLEAN NOT NULL DEFAULT false,
  template_category TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.script_flows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view flows"
  ON public.script_flows FOR SELECT
  USING (true);

CREATE POLICY "Users can create flows"
  ON public.script_flows FOR INSERT
  WITH CHECK ((auth.uid())::text = created_by);

CREATE POLICY "Users can update own flows"
  ON public.script_flows FOR UPDATE
  USING ((auth.uid())::text = created_by OR has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE POLICY "Users can delete own flows"
  ON public.script_flows FOR DELETE
  USING ((auth.uid())::text = created_by OR has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE POLICY "Admins can manage all flows"
  ON public.script_flows FOR ALL
  USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

-- Trigger for updated_at
CREATE TRIGGER update_script_flows_updated_at
  BEFORE UPDATE ON public.script_flows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
