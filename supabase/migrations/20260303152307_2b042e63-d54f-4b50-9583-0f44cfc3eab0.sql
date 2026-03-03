
CREATE TABLE public.playbook_user_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  playbook_id uuid NOT NULL REFERENCES script_playbooks(id) ON DELETE CASCADE,
  is_favourite boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, playbook_id)
);

ALTER TABLE public.playbook_user_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own playbook prefs"
  ON public.playbook_user_prefs FOR ALL
  USING ((auth.uid())::text = user_id)
  WITH CHECK ((auth.uid())::text = user_id);
