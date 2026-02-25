
-- Add public sharing columns to script_playbooks
ALTER TABLE public.script_playbooks
ADD COLUMN is_public boolean NOT NULL DEFAULT false,
ADD COLUMN share_token text UNIQUE DEFAULT NULL;

-- Create index on share_token for fast lookups
CREATE INDEX idx_script_playbooks_share_token ON public.script_playbooks (share_token) WHERE share_token IS NOT NULL;

-- Allow anonymous users to view public playbooks via share_token
CREATE POLICY "Anyone can view public playbooks by share_token"
ON public.script_playbooks
FOR SELECT
TO anon
USING (is_public = true AND share_token IS NOT NULL);

-- Allow anonymous users to view items of public playbooks
CREATE POLICY "Anyone can view items of public playbooks"
ON public.script_playbook_items
FOR SELECT
TO anon
USING (EXISTS (
  SELECT 1 FROM public.script_playbooks
  WHERE script_playbooks.id = script_playbook_items.playbook_id
  AND script_playbooks.is_public = true
  AND script_playbooks.share_token IS NOT NULL
));

-- Allow anon to view scripts (already has "Anyone can view scripts" but need to ensure anon role)
CREATE POLICY "Anon can view scripts"
ON public.scripts
FOR SELECT
TO anon
USING (true);

-- Allow anon to view objection entries
CREATE POLICY "Anon can view objection entries"
ON public.objection_entries
FOR SELECT
TO anon
USING (true);
