-- Step 1: Create simplified user_tiers table
CREATE TABLE IF NOT EXISTS public.user_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  tier_level text NOT NULL DEFAULT 'basic' CHECK (tier_level IN ('basic', 'intermediate', 'advanced')),
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_tiers
ALTER TABLE public.user_tiers ENABLE ROW LEVEL SECURITY;

-- Create policies for user_tiers
CREATE POLICY "Admins can manage tiers" ON public.user_tiers
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Users can view their own tier" ON public.user_tiers
  FOR SELECT USING (user_id = auth.uid()::text);

-- Step 2: Migrate data from user_access_tiers to user_tiers
INSERT INTO public.user_tiers (user_id, tier_level, granted_at, granted_by, created_at, updated_at)
SELECT 
  user_id,
  tier_level,
  granted_at,
  granted_by,
  created_at,
  updated_at
FROM public.user_access_tiers
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Clean up user_roles table - remove tier-like roles and admin roles that are duplicated
-- First, preserve admin roles in user_roles and remove duplicates from user_admin_roles
DELETE FROM public.user_roles 
WHERE role IN ('basic', 'intermediate', 'advanced');

-- Migrate admin roles from user_admin_roles to user_roles (avoiding duplicates)
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
SELECT 
  uar.user_id,
  CASE 
    WHEN uar.admin_role = 'super_admin' THEN 'master_admin'
    WHEN uar.admin_role IN ('admin', 'mentor') THEN uar.admin_role
    ELSE 'user'
  END as role,
  uar.created_at,
  uar.updated_at
FROM public.user_admin_roles uar
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = uar.user_id 
  AND ur.role = CASE 
    WHEN uar.admin_role = 'super_admin' THEN 'master_admin'
    WHEN uar.admin_role IN ('admin', 'mentor') THEN uar.admin_role
    ELSE 'user'
  END
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Update get_user_tier function to use new table
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(tier_level, 'basic')
  FROM public.user_tiers 
  WHERE user_tiers.user_id = user_id::text
  LIMIT 1
$$;

-- Step 5: Create simplified tier access function
CREATE OR REPLACE FUNCTION public.has_tier_access(user_id uuid, required_tier text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN public.has_role(user_id, 'master_admin') THEN true
      WHEN required_tier = 'basic' THEN true
      WHEN required_tier = 'intermediate' THEN public.get_user_tier(user_id) IN ('intermediate', 'advanced')
      WHEN required_tier = 'advanced' THEN public.get_user_tier(user_id) = 'advanced'
      ELSE false
    END
$$;

-- Step 6: Add triggers for updated_at
CREATE TRIGGER update_user_tiers_updated_at
  BEFORE UPDATE ON public.user_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 7: Drop old tables and functions (commented out for safety - uncomment after verification)
-- DROP TABLE IF EXISTS public.user_admin_roles;
-- DROP TABLE IF EXISTS public.user_access_tiers; 
-- DROP TABLE IF EXISTS public.tier_permissions;
-- DROP FUNCTION IF EXISTS public.get_user_admin_role(uuid);
-- DROP FUNCTION IF EXISTS public.has_admin_role(uuid, text);
-- DROP FUNCTION IF EXISTS public.get_user_access_tier(uuid);