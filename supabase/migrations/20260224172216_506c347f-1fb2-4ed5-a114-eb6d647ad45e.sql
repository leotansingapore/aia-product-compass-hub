
-- Add item_type and objection_id to support both scripts and objections in playbooks
ALTER TABLE public.script_playbook_items
ADD COLUMN item_type text NOT NULL DEFAULT 'script',
ADD COLUMN objection_id uuid REFERENCES public.objection_entries(id) ON DELETE CASCADE;

-- Make script_id nullable (objection items won't have a script_id)
ALTER TABLE public.script_playbook_items
ALTER COLUMN script_id DROP NOT NULL;

-- Add check constraint: exactly one of script_id or objection_id must be set
ALTER TABLE public.script_playbook_items
ADD CONSTRAINT playbook_item_type_check
CHECK (
  (item_type = 'script' AND script_id IS NOT NULL AND objection_id IS NULL)
  OR (item_type = 'objection' AND objection_id IS NOT NULL AND script_id IS NULL)
);
