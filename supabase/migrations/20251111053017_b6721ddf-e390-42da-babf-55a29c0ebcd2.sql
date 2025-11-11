-- Drop and recreate get_user_admin_role function with fixed parameter naming
DROP FUNCTION IF EXISTS public.get_user_admin_role(uuid);

CREATE OR REPLACE FUNCTION public.get_user_admin_role(_user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(admin_role, 'user')
  FROM public.user_admin_roles 
  WHERE user_id = _user_id::text
  ORDER BY 
    CASE admin_role 
      WHEN 'master_admin' THEN 5
      WHEN 'admin' THEN 4
      WHEN 'consultant' THEN 3
      WHEN 'mentor' THEN 2
      WHEN 'user' THEN 1
      ELSE 0
    END DESC
  LIMIT 1
$$;

COMMENT ON FUNCTION public.get_user_admin_role IS 'Returns the highest priority admin role for a user. Fixed parameter naming to avoid column shadowing bug.';