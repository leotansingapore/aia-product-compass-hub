
-- Add custom_content to store playbook-local edits (overrides original script content)
ALTER TABLE public.script_playbook_items
ADD COLUMN custom_content jsonb NULL;

-- Add allow_public_edit flag to playbooks
ALTER TABLE public.script_playbooks
ADD COLUMN allow_public_edit boolean NOT NULL DEFAULT false;

-- Allow anon to UPDATE custom_content on items of public editable playbooks
CREATE POLICY "Anon can update custom_content on public editable playbook items"
ON public.script_playbook_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM script_playbooks
    WHERE script_playbooks.id = script_playbook_items.playbook_id
      AND script_playbooks.is_public = true
      AND script_playbooks.allow_public_edit = true
      AND script_playbooks.share_token IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM script_playbooks
    WHERE script_playbooks.id = script_playbook_items.playbook_id
      AND script_playbooks.is_public = true
      AND script_playbooks.allow_public_edit = true
      AND script_playbooks.share_token IS NOT NULL
  )
);
