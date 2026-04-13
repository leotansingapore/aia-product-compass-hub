
-- Add hidden_resources column to learning_track_items
ALTER TABLE public.learning_track_items
  ADD COLUMN hidden_resources text[] NOT NULL DEFAULT '{}';

-- Add shareable column to obsidian_resources
ALTER TABLE public.obsidian_resources
  ADD COLUMN shareable boolean NOT NULL DEFAULT false;

-- Drop existing SELECT policy on obsidian_resources
DROP POLICY IF EXISTS "lt_content_select_authenticated" ON public.obsidian_resources;

-- Create new SELECT policy: admins see all, non-admins only shareable rows
CREATE POLICY "lt_content_select_authenticated" ON public.obsidian_resources
  FOR SELECT TO authenticated
  USING (
    shareable = true
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master_admin')
  );
