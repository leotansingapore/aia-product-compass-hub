-- Create policy for master admins to view all profiles
CREATE POLICY "Master admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'master_admin'));

-- Create policy for master admins to manage all profiles
CREATE POLICY "Master admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'master_admin'))
WITH CHECK (public.has_role(auth.uid(), 'master_admin'));