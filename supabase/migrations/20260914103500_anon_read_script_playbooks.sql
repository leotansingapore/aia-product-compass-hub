-- The growing-age-calculator Scripts tool reads the playbook list through the
-- Compass Hub anon key (same cross-project pattern as plans_catalog). Items were
-- already anon-readable ("Anyone can view playbook items"); this opens the
-- parent rows to match. Writes stay owner/collaborator/admin only.
CREATE POLICY "Anon can view all playbooks"
  ON public.script_playbooks
  FOR SELECT
  TO anon
  USING (true);
