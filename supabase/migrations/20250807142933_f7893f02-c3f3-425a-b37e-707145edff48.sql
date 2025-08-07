-- Update user_roles table to handle Clerk user IDs (text instead of uuid)
ALTER TABLE public.user_roles 
ALTER COLUMN user_id TYPE text;

-- Update profiles table to handle Clerk user IDs
ALTER TABLE public.profiles 
ALTER COLUMN user_id TYPE text;

-- Update the get_user_tier function to handle text user IDs
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id text)
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

-- Update has_role function to handle text user IDs
CREATE OR REPLACE FUNCTION public.has_role(_user_id text, _role text)
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

-- Update has_tier_access function to handle text user IDs
CREATE OR REPLACE FUNCTION public.has_tier_access(user_id text, access_type text, resource_id text)
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

-- Create a function to assign roles for Clerk users
CREATE OR REPLACE FUNCTION public.assign_clerk_user_role(clerk_user_id text, user_email text, user_role text DEFAULT 'user')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert profile for Clerk user
    INSERT INTO public.profiles (user_id, email, display_name)
    VALUES (clerk_user_id, user_email, 'User')
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email;
    
    -- Assign role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (clerk_user_id, user_role)
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;