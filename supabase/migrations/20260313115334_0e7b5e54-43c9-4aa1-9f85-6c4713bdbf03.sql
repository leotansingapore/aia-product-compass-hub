CREATE TABLE public.feedback_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,
  user_name TEXT,
  type TEXT NOT NULL DEFAULT 'feedback',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit their own feedback"
  ON public.feedback_submissions FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can view their own feedback"
  ON public.feedback_submissions FOR SELECT
  USING ((auth.uid())::text = user_id);

CREATE POLICY "Admins can view all feedback"
  ON public.feedback_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE POLICY "Admins can update all feedback"
  ON public.feedback_submissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE POLICY "Admins can delete feedback"
  ON public.feedback_submissions FOR DELETE
  USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_feedback_submissions_updated_at
  BEFORE UPDATE ON public.feedback_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();