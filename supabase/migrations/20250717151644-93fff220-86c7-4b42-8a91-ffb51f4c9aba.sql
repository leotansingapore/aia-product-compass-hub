-- Drop the problematic RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "Master admins can manage all roles" ON public.user_roles;

-- Create a new policy that uses the security definer function to avoid recursion
CREATE POLICY "Master admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'master_admin'))
WITH CHECK (public.has_role(auth.uid(), 'master_admin'));

-- Also create a policy to allow service role to manage roles (for the assign_master_admin function)
CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);