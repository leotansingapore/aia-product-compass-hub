-- Clean up conflicting get_user_tier functions and fix for UUID user IDs
DROP FUNCTION IF EXISTS public.get_user_tier(text);
DROP FUNCTION IF EXISTS public.has_role(text, text);

-- Ensure we have the correct UUID-based functions
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_roles.user_id = get_user_tier.user_id 
    AND role IN ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'master_admin', 'user', 'admin')
  ORDER BY 
    CASE role 
      WHEN 'master_admin' THEN 6
      WHEN 'admin' THEN 5
      WHEN 'tier_4' THEN 4
      WHEN 'tier_3' THEN 3
      WHEN 'tier_2' THEN 2
      WHEN 'tier_1' THEN 1
      WHEN 'user' THEN 0
      ELSE -1
    END DESC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update has_tier_access function to use UUID
CREATE OR REPLACE FUNCTION public.has_tier_access(user_id uuid, access_type text, resource_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.tier_permissions tp
    WHERE tp.tier_level = public.get_user_tier(user_id)
      AND tp.access_type = has_tier_access.access_type
      AND tp.resource_id = has_tier_access.resource_id
  ) OR public.get_user_tier(user_id) = 'master_admin'
$$;