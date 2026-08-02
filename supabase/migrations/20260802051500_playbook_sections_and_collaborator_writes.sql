-- 1) Allow 'section' items (the Add Section feature inserts item_type='section'
--    with no script_id/objection_id; the original CHECK rejected every insert).
ALTER TABLE public.script_playbook_items DROP CONSTRAINT playbook_item_type_check;
ALTER TABLE public.script_playbook_items ADD CONSTRAINT playbook_item_type_check CHECK (
  (item_type = 'script' AND script_id IS NOT NULL AND objection_id IS NULL)
  OR (item_type = 'objection' AND objection_id IS NOT NULL AND script_id IS NULL)
  OR (item_type = 'section' AND script_id IS NULL AND objection_id IS NULL)
);

-- 2) Collaborators (playbook_collaborators) get item write access. Without this,
--    approved editors saw an owner UI whose UPDATE/DELETE silently affected 0 rows.
CREATE POLICY "Collaborators can manage playbook items"
ON public.script_playbook_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.playbook_collaborators pc
    WHERE pc.playbook_id = script_playbook_items.playbook_id
      AND pc.user_id = (auth.uid())::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playbook_collaborators pc
    WHERE pc.playbook_id = script_playbook_items.playbook_id
      AND pc.user_id = (auth.uid())::text
  )
);

-- 3) Let a requester re-submit their own rejected edit request (previously a
--    permanent dead end: unique(playbook_id, requester_id) blocked re-insert and
--    only owners could UPDATE).
CREATE POLICY "Requesters can resubmit rejected requests"
ON public.playbook_edit_requests FOR UPDATE
USING ((auth.uid())::text = requester_id AND status = 'rejected')
WITH CHECK ((auth.uid())::text = requester_id);
