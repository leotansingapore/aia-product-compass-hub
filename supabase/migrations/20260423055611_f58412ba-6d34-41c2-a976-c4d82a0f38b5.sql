CREATE TABLE public.user_checklist_progress (
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id      text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

CREATE INDEX idx_user_checklist_progress_user ON public.user_checklist_progress(user_id);

ALTER TABLE public.user_checklist_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_checklist_progress_select_own"
  ON public.user_checklist_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_checklist_progress_insert_own"
  ON public.user_checklist_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_checklist_progress_delete_own"
  ON public.user_checklist_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "user_checklist_progress_select_admin"
  ON public.user_checklist_progress FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));