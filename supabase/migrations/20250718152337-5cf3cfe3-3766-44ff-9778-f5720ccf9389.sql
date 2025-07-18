
-- Phase 1: Create tables for pages and tabs with permission system

-- Create app_pages table to track page-level information
CREATE TABLE public.app_pages (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  path text NOT NULL,
  category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create app_tabs table to track tab-level information  
CREATE TABLE public.app_tabs (
  id text PRIMARY KEY,
  page_id text NOT NULL REFERENCES public.app_pages(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  tab_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_page_permissions table for page-level permissions
CREATE TABLE public.user_page_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  page_id text NOT NULL REFERENCES public.app_pages(id) ON DELETE CASCADE,
  permission_type text NOT NULL DEFAULT 'view',
  lock_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, page_id)
);

-- Create user_tab_permissions table for tab-level permissions
CREATE TABLE public.user_tab_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tab_id text NOT NULL REFERENCES public.app_tabs(id) ON DELETE CASCADE,
  permission_type text NOT NULL DEFAULT 'view',
  lock_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, tab_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.app_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tab_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for app_pages (anyone can view)
CREATE POLICY "Anyone can view app pages" 
  ON public.app_pages 
  FOR SELECT 
  USING (true);

-- Create RLS policies for app_tabs (anyone can view)
CREATE POLICY "Anyone can view app tabs" 
  ON public.app_tabs 
  FOR SELECT 
  USING (true);

-- Create RLS policies for user_page_permissions
CREATE POLICY "Users can view their own page permissions" 
  ON public.user_page_permissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Master admins can manage all page permissions" 
  ON public.user_page_permissions 
  FOR ALL 
  USING (has_role(auth.uid(), 'master_admin'));

-- Create RLS policies for user_tab_permissions  
CREATE POLICY "Users can view their own tab permissions" 
  ON public.user_tab_permissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Master admins can manage all tab permissions" 
  ON public.user_tab_permissions 
  FOR ALL 
  USING (has_role(auth.uid(), 'master_admin'));

-- Create database functions for permission checks
CREATE OR REPLACE FUNCTION public.get_page_permission(_user_id uuid, _page_id text)
RETURNS TABLE(permission_type text, lock_message text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(upp.permission_type, 'view') as permission_type,
    upp.lock_message
  FROM public.user_page_permissions upp
  WHERE upp.user_id = _user_id AND upp.page_id = _page_id
  UNION ALL
  SELECT 'view' as permission_type, NULL as lock_message
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_page_permissions upp2
    WHERE upp2.user_id = _user_id AND upp2.page_id = _page_id
  )
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_tab_permission(_user_id uuid, _tab_id text)
RETURNS TABLE(permission_type text, lock_message text)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(utp.permission_type, 'view') as permission_type,
    utp.lock_message
  FROM public.user_tab_permissions utp
  WHERE utp.user_id = _user_id AND utp.tab_id = _tab_id
  UNION ALL
  SELECT 'view' as permission_type, NULL as lock_message
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_tab_permissions utp2
    WHERE utp2.user_id = _user_id AND utp2.tab_id = _tab_id
  )
  LIMIT 1
$$;

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_app_pages_updated_at
  BEFORE UPDATE ON public.app_pages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_app_tabs_updated_at
  BEFORE UPDATE ON public.app_tabs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_page_permissions_updated_at
  BEFORE UPDATE ON public.user_page_permissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_tab_permissions_updated_at
  BEFORE UPDATE ON public.user_tab_permissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
