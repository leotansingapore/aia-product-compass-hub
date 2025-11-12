-- Fix get_user_access_tier to return most recent tier and mark as VOLATILE
DROP FUNCTION IF EXISTS public.get_user_access_tier(uuid);

CREATE OR REPLACE FUNCTION public.get_user_access_tier(user_id uuid)
RETURNS text
LANGUAGE sql
VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(tier_level, 'level_1')
  FROM public.user_access_tiers 
  WHERE user_access_tiers.user_id = $1::text
  ORDER BY updated_at DESC
  LIMIT 1;
$$;

-- Also fix get_user_admin_role to be consistent
DROP FUNCTION IF EXISTS public.get_user_admin_role(uuid);

CREATE OR REPLACE FUNCTION public.get_user_admin_role(user_id uuid)
RETURNS text
LANGUAGE sql
VOLATILE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(admin_role, 'user')
  FROM public.user_admin_roles 
  WHERE user_admin_roles.user_id = $1::text
  ORDER BY updated_at DESC
  LIMIT 1;
$$;