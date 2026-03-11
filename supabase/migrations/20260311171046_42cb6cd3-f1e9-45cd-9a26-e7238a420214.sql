
-- Create concept_cards table
CREATE TABLE public.concept_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_image_url TEXT,
  audience TEXT[] DEFAULT '{}',
  product_type TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.concept_cards ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "Authenticated users can view concept cards"
  ON public.concept_cards FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert concept cards"
  ON public.concept_cards FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles
      WHERE user_id = auth.uid()::text
      AND admin_role IN ('admin', 'master_admin')
    )
  );

-- Only admins can update
CREATE POLICY "Admins can update concept cards"
  ON public.concept_cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles
      WHERE user_id = auth.uid()::text
      AND admin_role IN ('admin', 'master_admin')
    )
  );

-- Only admins can delete
CREATE POLICY "Admins can delete concept cards"
  ON public.concept_cards FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_admin_roles
      WHERE user_id = auth.uid()::text
      AND admin_role IN ('admin', 'master_admin')
    )
  );

-- Updated_at trigger
CREATE TRIGGER update_concept_cards_updated_at
  BEFORE UPDATE ON public.concept_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for concept card images
INSERT INTO storage.buckets (id, name, public)
VALUES ('concept-card-images', 'concept-card-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for concept card images
CREATE POLICY "Concept card images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'concept-card-images');

-- Authenticated users can upload concept card images
CREATE POLICY "Authenticated users can upload concept card images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'concept-card-images');

-- Authenticated users can update concept card images
CREATE POLICY "Authenticated users can update concept card images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'concept-card-images');

-- Authenticated users can delete concept card images
CREATE POLICY "Authenticated users can delete concept card images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'concept-card-images');
