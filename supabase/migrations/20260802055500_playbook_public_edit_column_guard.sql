-- The anon/public UPDATE policy on script_playbook_items (edit links for
-- allow_public_edit playbooks) is row-scoped, not column-scoped: anyone with an
-- edit link could rewrite sort_order, swap script_id, or move items between
-- editable playbooks. This guard restricts non-privileged editors (not owner,
-- not collaborator, not admin) to custom_content changes only.
CREATE OR REPLACE FUNCTION public.guard_playbook_item_public_edit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_privileged boolean;
BEGIN
  SELECT (
    has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'master_admin')
    OR EXISTS (
      SELECT 1 FROM public.script_playbooks sp
      WHERE sp.id = OLD.playbook_id AND sp.created_by = (auth.uid())::text
    )
    OR EXISTS (
      SELECT 1 FROM public.playbook_collaborators pc
      WHERE pc.playbook_id = OLD.playbook_id AND pc.user_id = (auth.uid())::text
    )
  ) INTO is_privileged;

  IF is_privileged THEN
    RETURN NEW;
  END IF;

  IF NEW.playbook_id IS DISTINCT FROM OLD.playbook_id
     OR NEW.script_id IS DISTINCT FROM OLD.script_id
     OR NEW.objection_id IS DISTINCT FROM OLD.objection_id
     OR NEW.item_type IS DISTINCT FROM OLD.item_type
     OR NEW.sort_order IS DISTINCT FROM OLD.sort_order THEN
    RAISE EXCEPTION 'Public edit links may only change script content';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_playbook_item_public_edit ON public.script_playbook_items;
CREATE TRIGGER guard_playbook_item_public_edit
BEFORE UPDATE ON public.script_playbook_items
FOR EACH ROW EXECUTE FUNCTION public.guard_playbook_item_public_edit();
