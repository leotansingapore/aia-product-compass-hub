
-- Objection entries: the main objection scenarios
CREATE TABLE public.objection_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'generic',
  description text,
  tags text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Objection responses: user-contributed responses to objections
CREATE TABLE public.objection_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objection_id uuid NOT NULL REFERENCES public.objection_entries(id) ON DELETE CASCADE,
  content text NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  user_id text NOT NULL,
  upvotes integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.objection_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objection_responses ENABLE ROW LEVEL SECURITY;

-- Objection entries: anyone can view, admins can manage
CREATE POLICY "Anyone can view objection entries"
  ON public.objection_entries FOR SELECT USING (true);

CREATE POLICY "Admins can insert objection entries"
  ON public.objection_entries FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Admins can update objection entries"
  ON public.objection_entries FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Admins can delete objection entries"
  ON public.objection_entries FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Objection responses: anyone can view, authenticated users can contribute their own
CREATE POLICY "Anyone can view objection responses"
  ON public.objection_responses FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert responses"
  ON public.objection_responses FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id);

CREATE POLICY "Users can update own responses"
  ON public.objection_responses FOR UPDATE
  USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can delete own responses"
  ON public.objection_responses FOR DELETE
  USING ((auth.uid())::text = user_id);

CREATE POLICY "Admins can manage all responses"
  ON public.objection_responses FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Triggers for updated_at
CREATE TRIGGER update_objection_entries_updated_at
  BEFORE UPDATE ON public.objection_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_objection_responses_updated_at
  BEFORE UPDATE ON public.objection_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
