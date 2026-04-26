DROP POLICY IF EXISTS "assignment_submissions_admin_select" ON public.assignment_submissions;

CREATE POLICY "assignment_submissions_admin_select"
  ON public.assignment_submissions
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::text)
    OR public.has_role(auth.uid(), 'master_admin'::text)
  );