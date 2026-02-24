
-- Create script version history table for Google Docs-style rollback
CREATE TABLE public.script_version_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id uuid NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  versions jsonb NOT NULL DEFAULT '[]'::jsonb,
  edited_by text NOT NULL,
  editor_name text NOT NULL DEFAULT 'Unknown',
  edit_summary text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.script_version_history ENABLE ROW LEVEL SECURITY;

-- Anyone can view version history
CREATE POLICY "Anyone can view script version history"
ON public.script_version_history
FOR SELECT
USING (true);

-- Authenticated users can insert version history
CREATE POLICY "Authenticated users can insert version history"
ON public.script_version_history
FOR INSERT
WITH CHECK (true);

-- Only admins can delete version history (rollback cleanup)
CREATE POLICY "Admins can delete version history"
ON public.script_version_history
FOR DELETE
USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

-- Update scripts RLS: allow all authenticated users to update (not just admins)
DROP POLICY "Admins can update scripts" ON public.scripts;

CREATE POLICY "Authenticated users can update scripts"
ON public.scripts
FOR UPDATE
USING (true);

-- Create index for fast lookups
CREATE INDEX idx_script_version_history_script_id ON public.script_version_history(script_id);
CREATE INDEX idx_script_version_history_created_at ON public.script_version_history(created_at DESC);
