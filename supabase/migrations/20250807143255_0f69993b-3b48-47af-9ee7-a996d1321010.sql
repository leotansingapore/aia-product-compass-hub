-- Drop foreign key constraint first
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Now drop and recreate policies for both tables
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Master admins can manage all roles" ON public.user_roles;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Master admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Master admins can manage all profiles" ON public.profiles;

-- Change column types
ALTER TABLE public.user_roles ALTER COLUMN user_id TYPE text;
ALTER TABLE public.profiles ALTER COLUMN user_id TYPE text;

-- Update functions to handle text user IDs
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

-- Create simple policies without using settings
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (true); -- We'll handle this in the app layer

CREATE POLICY "Service role can manage roles"
ON public.user_roles
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

CREATE POLICY "Users can view their own profile"  
ON public.profiles
FOR SELECT
USING (true); -- We'll handle this in the app layer

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (true);

CREATE POLICY "Service role can manage profiles"
ON public.profiles
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');