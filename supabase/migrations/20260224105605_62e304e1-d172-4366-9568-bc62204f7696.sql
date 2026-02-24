-- Allow all authenticated users to insert scripts
DROP POLICY "Admins can insert scripts" ON public.scripts;

CREATE POLICY "Authenticated users can insert scripts"
ON public.scripts
FOR INSERT
TO authenticated
WITH CHECK (true);