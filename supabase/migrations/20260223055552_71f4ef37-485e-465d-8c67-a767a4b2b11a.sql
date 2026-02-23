
-- Playbook collections
CREATE TABLE public.script_playbooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  created_by text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Items within a playbook (with ordering)
CREATE TABLE public.script_playbook_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id uuid NOT NULL REFERENCES public.script_playbooks(id) ON DELETE CASCADE,
  script_id uuid NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(playbook_id, script_id)
);

-- Enable RLS
ALTER TABLE public.script_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_playbook_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view all playbooks (shareable to everyone)
CREATE POLICY "Anyone can view playbooks" ON public.script_playbooks FOR SELECT USING (true);

-- Users can create their own playbooks
CREATE POLICY "Users can create playbooks" ON public.script_playbooks FOR INSERT WITH CHECK (auth.uid()::text = created_by);

-- Users can update their own playbooks
CREATE POLICY "Users can update own playbooks" ON public.script_playbooks FOR UPDATE USING (auth.uid()::text = created_by);

-- Users can delete their own playbooks
CREATE POLICY "Users can delete own playbooks" ON public.script_playbooks FOR DELETE USING (auth.uid()::text = created_by);

-- Admins can manage all playbooks
CREATE POLICY "Admins can manage all playbooks" ON public.script_playbooks FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Everyone can view playbook items
CREATE POLICY "Anyone can view playbook items" ON public.script_playbook_items FOR SELECT USING (true);

-- Playbook owners can manage items
CREATE POLICY "Owners can manage playbook items" ON public.script_playbook_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.script_playbooks WHERE id = script_playbook_items.playbook_id AND created_by = auth.uid()::text)
);

-- Admins can manage all playbook items
CREATE POLICY "Admins can manage all playbook items" ON public.script_playbook_items FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Timestamps trigger
CREATE TRIGGER update_script_playbooks_updated_at
BEFORE UPDATE ON public.script_playbooks
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
