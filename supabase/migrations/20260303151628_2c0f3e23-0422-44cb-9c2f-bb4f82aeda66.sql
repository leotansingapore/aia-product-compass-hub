
CREATE TABLE public.playbook_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id uuid NOT NULL REFERENCES script_playbooks(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  granted_by text NOT NULL,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (playbook_id, user_id)
);

ALTER TABLE public.playbook_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner and admin can manage collaborators"
  ON public.playbook_collaborators FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'master_admin') OR
    EXISTS (
      SELECT 1 FROM script_playbooks sp
      WHERE sp.id = playbook_collaborators.playbook_id
        AND sp.created_by = (auth.uid())::text
    )
  );

CREATE POLICY "Authenticated users can view collaborators"
  ON public.playbook_collaborators FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE TABLE public.playbook_edit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id uuid NOT NULL REFERENCES script_playbooks(id) ON DELETE CASCADE,
  requester_id text NOT NULL,
  requester_name text,
  requester_email text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by text,
  UNIQUE (playbook_id, requester_id)
);

ALTER TABLE public.playbook_edit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own edit requests"
  ON public.playbook_edit_requests FOR INSERT
  WITH CHECK ((auth.uid())::text = requester_id);

CREATE POLICY "Users can view their own requests"
  ON public.playbook_edit_requests FOR SELECT
  USING ((auth.uid())::text = requester_id);

CREATE POLICY "Owner and admin can view all requests"
  ON public.playbook_edit_requests FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'master_admin') OR
    EXISTS (
      SELECT 1 FROM script_playbooks sp
      WHERE sp.id = playbook_edit_requests.playbook_id
        AND sp.created_by = (auth.uid())::text
    )
  );

CREATE POLICY "Owner and admin can update requests"
  ON public.playbook_edit_requests FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'master_admin') OR
    EXISTS (
      SELECT 1 FROM script_playbooks sp
      WHERE sp.id = playbook_edit_requests.playbook_id
        AND sp.created_by = (auth.uid())::text
    )
  );
