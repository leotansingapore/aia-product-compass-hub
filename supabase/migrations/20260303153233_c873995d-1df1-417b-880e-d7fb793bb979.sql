-- Revert overly restrictive policy - filtering is handled at app level
DROP POLICY IF EXISTS "Users see own, public, or collaborated playbooks" ON public.script_playbooks;

-- Allow all authenticated users to view all playbooks (app-level filtering handles hide/show)
CREATE POLICY "Authenticated users can view all playbooks"
  ON public.script_playbooks FOR SELECT
  USING (auth.uid() IS NOT NULL);