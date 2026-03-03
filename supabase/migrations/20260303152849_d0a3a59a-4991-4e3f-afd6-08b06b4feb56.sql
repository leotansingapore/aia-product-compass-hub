-- Drop any existing SELECT policy on script_playbooks
DROP POLICY IF EXISTS "Users can view playbooks" ON public.script_playbooks;
DROP POLICY IF EXISTS "Authenticated users can view playbooks" ON public.script_playbooks;
DROP POLICY IF EXISTS "Anyone can view playbooks" ON public.script_playbooks;

-- New policy: users see their own playbooks + public playbooks + playbooks they collaborate on
-- Admins see everything
CREATE POLICY "Users see own, public, or collaborated playbooks"
  ON public.script_playbooks FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin')
    OR created_by = (auth.uid())::text
    OR is_public = true
    OR EXISTS (
      SELECT 1 FROM public.playbook_collaborators pc
      WHERE pc.playbook_id = script_playbooks.id
        AND pc.user_id = (auth.uid())::text
    )
  );