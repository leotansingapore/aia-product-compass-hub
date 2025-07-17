-- Create app sections table to define all lockable sections
CREATE TABLE public.app_sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'product', 'cmfas', 'general'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'master_admin', 'admin', 'user', 'restricted'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create user section permissions table for granular control
CREATE TABLE public.user_section_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section_id TEXT NOT NULL REFERENCES public.app_sections(id),
  permission_type TEXT NOT NULL DEFAULT 'view', -- 'hidden', 'locked', 'read_only', 'view', 'edit'
  lock_message TEXT, -- Custom message to show when locked
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_id)
);

-- Enable RLS on all tables
ALTER TABLE public.app_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_section_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_sections (anyone can view)
CREATE POLICY "Anyone can view app sections" 
ON public.app_sections 
FOR SELECT 
USING (true);

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Master admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'master_admin'
  )
);

-- RLS policies for user_section_permissions
CREATE POLICY "Users can view their own section permissions" 
ON public.user_section_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Master admins can manage all section permissions" 
ON public.user_section_permissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'master_admin'
  )
);

-- Security definer functions to check permissions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_section_permission(_user_id UUID, _section_id TEXT)
RETURNS TABLE(permission_type TEXT, lock_message TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(usp.permission_type, 'view') as permission_type,
    usp.lock_message
  FROM public.user_section_permissions usp
  WHERE usp.user_id = _user_id AND usp.section_id = _section_id
  UNION ALL
  SELECT 'view' as permission_type, NULL as lock_message
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_section_permissions usp2
    WHERE usp2.user_id = _user_id AND usp2.section_id = _section_id
  )
  LIMIT 1
$$;

-- Insert default app sections
INSERT INTO public.app_sections (id, name, description, category) VALUES
-- Product sections
('product_summary', 'Product Summary', 'Product description and overview', 'product'),
('product_highlights', 'Key Highlights', 'Product key features and benefits', 'product'),
('product_links', 'Useful Links', 'Product documentation and resources', 'product'),
('product_ai', 'Ask the AI', 'AI assistant for product questions', 'product'),
('product_videos', 'Training Videos', 'Product training and educational videos', 'product'),
('product_quiz', 'Product Quiz', 'Knowledge assessment quiz', 'product'),
('product_notes', 'Personal Notes', 'User personal notes for the product', 'product'),
('product_tags', 'Tags & Bookmarks', 'Product categorization and bookmarks', 'product'),

-- CMFAS sections
('cmfas_links', 'CMFAS Useful Links', 'CMFAS study resources and links', 'cmfas'),
('cmfas_ai', 'CMFAS AI Assistant', 'AI assistance for CMFAS studies', 'cmfas'),
('cmfas_lectures', 'Tutorial Lectures', 'CMFAS tutorial and lecture content', 'cmfas'),
('cmfas_content', 'Module Content', 'CMFAS module specific content', 'cmfas'),

-- General sections
('sales_tools', 'Sales Tools', 'Sales and marketing tools', 'general'),
('search_profile', 'Search by Profile', 'Advanced search functionality', 'general');

-- Create triggers for updated_at
CREATE TRIGGER update_app_sections_updated_at
  BEFORE UPDATE ON public.app_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_section_permissions_updated_at
  BEFORE UPDATE ON public.user_section_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();