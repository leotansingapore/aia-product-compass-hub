-- Add policy to allow anonymous users to manage video progress (for development)
CREATE POLICY "Anonymous users can manage video progress in development" 
ON public.video_progress 
FOR ALL
TO anon
USING (true)
WITH CHECK (true);