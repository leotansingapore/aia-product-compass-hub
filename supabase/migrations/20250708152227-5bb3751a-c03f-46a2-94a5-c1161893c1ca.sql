-- Add policy to allow anonymous users to manage products (for development)
CREATE POLICY "Anonymous users can manage products in development" 
ON public.products 
FOR ALL
TO anon
USING (true)
WITH CHECK (true);