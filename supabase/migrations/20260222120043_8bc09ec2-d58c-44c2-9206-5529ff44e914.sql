
-- Create scripts table
CREATE TABLE public.scripts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage text NOT NULL,
  category text NOT NULL,
  versions jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;

-- Everyone can read scripts
CREATE POLICY "Anyone can view scripts"
ON public.scripts FOR SELECT
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert scripts"
ON public.scripts FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Only admins can update
CREATE POLICY "Admins can update scripts"
ON public.scripts FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete scripts"
ON public.scripts FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Trigger for updated_at
CREATE TRIGGER update_scripts_updated_at
BEFORE UPDATE ON public.scripts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Index for category filtering
CREATE INDEX idx_scripts_category ON public.scripts(category);
CREATE INDEX idx_scripts_sort_order ON public.scripts(sort_order);
