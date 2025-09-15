-- Phase 1: Create new tables for cleaner role/tier separation (Fixed)

-- Create access tiers table
CREATE TABLE public.user_access_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  tier_level text NOT NULL DEFAULT 'basic',
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_tier_level CHECK (tier_level IN ('basic', 'intermediate', 'advanced', 'premium'))
);

-- Create admin roles table  
CREATE TABLE public.user_admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  admin_role text NOT NULL DEFAULT 'user',
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_admin_role CHECK (admin_role IN ('user', 'mentor', 'admin', 'super_admin')),
  UNIQUE(user_id, admin_role)
);

-- Enable RLS on new tables
ALTER TABLE public.user_access_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_admin_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for access tiers
CREATE POLICY "Users can view their own access tier" 
ON public.user_access_tiers 
FOR SELECT 
USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can view all access tiers" 
ON public.user_access_tiers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Admins can manage access tiers" 
ON public.user_access_tiers 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Create RLS policies for admin roles
CREATE POLICY "Users can view their own admin roles" 
ON public.user_admin_roles 
FOR SELECT 
USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can view all admin roles" 
ON public.user_admin_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Admins can manage admin roles" 
ON public.user_admin_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Migrate existing data - Access Tiers (one per user)
INSERT INTO public.user_access_tiers (user_id, tier_level, granted_at)
SELECT DISTINCT
  user_id,
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = ur.user_id AND ur2.role = 'advanced') THEN 'advanced'
    WHEN EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = ur.user_id AND ur2.role = 'intermediate') THEN 'intermediate'
    WHEN EXISTS (SELECT 1 FROM public.user_roles ur2 WHERE ur2.user_id = ur.user_id AND ur2.role = 'basic') THEN 'basic'
    ELSE 'basic'
  END as tier_level,
  MIN(created_at) as granted_at
FROM public.user_roles ur
GROUP BY user_id;

-- Migrate existing data - Admin Roles (can have multiple)
INSERT INTO public.user_admin_roles (user_id, admin_role, granted_at)
SELECT 
  user_id,
  CASE 
    WHEN role = 'master_admin' THEN 'super_admin'
    WHEN role = 'admin' THEN 'admin'
    WHEN role = 'mentor' THEN 'mentor'
    ELSE 'user'
  END as admin_role,
  created_at
FROM public.user_roles
WHERE role IN ('master_admin', 'admin', 'mentor', 'user');

-- Create updated permission checking functions
CREATE OR REPLACE FUNCTION public.get_user_access_tier(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(tier_level, 'basic')
  FROM public.user_access_tiers 
  WHERE user_access_tiers.user_id = user_id::text
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_admin_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(admin_role, 'user')
  FROM public.user_admin_roles 
  WHERE user_admin_roles.user_id = user_id::text
  ORDER BY 
    CASE admin_role 
      WHEN 'super_admin' THEN 4
      WHEN 'admin' THEN 3
      WHEN 'mentor' THEN 2
      WHEN 'user' THEN 1
      ELSE 0
    END DESC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_admin_role(user_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_admin_roles
    WHERE user_admin_roles.user_id = user_id::text AND admin_role = required_role
  ) OR public.get_user_admin_role(user_id) = 'super_admin'
$$;

-- Simplify user_approval_requests status values
UPDATE public.user_approval_requests 
SET status = 'active' 
WHERE status = 'approved';

-- Add triggers for updated_at
CREATE TRIGGER update_user_access_tiers_updated_at
  BEFORE UPDATE ON public.user_access_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_admin_roles_updated_at
  BEFORE UPDATE ON public.user_admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();