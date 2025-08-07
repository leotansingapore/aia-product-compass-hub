-- Drop policies that depend on user_id columns before altering column types
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Master admins can manage all roles" ON public.user_roles;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Master admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Master admins can manage all profiles" ON public.profiles;

-- Now alter the column types
ALTER TABLE public.user_roles ALTER COLUMN user_id TYPE text;
ALTER TABLE public.profiles ALTER COLUMN user_id TYPE text;

-- Recreate the policies with the new column types
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (has_role(current_setting('app.current_user_id', true), 'master_admin'::text) OR has_role(current_setting('app.current_user_id', true), 'admin'::text) OR (current_setting('role'::text) = 'service_role'::text))
WITH CHECK (has_role(current_setting('app.current_user_id', true), 'master_admin'::text) OR has_role(current_setting('app.current_user_id', true), 'admin'::text) OR (current_setting('role'::text) = 'service_role'::text));

CREATE POLICY "Master admins can manage all roles"
ON public.user_roles
FOR ALL
USING (has_role(current_setting('app.current_user_id', true), 'master_admin'::text))
WITH CHECK (has_role(current_setting('app.current_user_id', true), 'master_admin'::text));

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK ((current_setting('app.current_user_id', true) = user_id) OR has_role(current_setting('app.current_user_id', true), 'admin'::text) OR has_role(current_setting('app.current_user_id', true), 'master_admin'::text));

CREATE POLICY "Master admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(current_setting('app.current_user_id', true), 'master_admin'::text));

CREATE POLICY "Master admins can manage all profiles"
ON public.profiles
FOR ALL
USING (has_role(current_setting('app.current_user_id', true), 'master_admin'::text))
WITH CHECK (has_role(current_setting('app.current_user_id', true), 'master_admin'::text));