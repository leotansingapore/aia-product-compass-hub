-- Fix security warnings: Add search_path to functions

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