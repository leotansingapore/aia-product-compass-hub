-- Add image_urls array to support multiple images per concept card
ALTER TABLE public.concept_cards ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Migrate existing image_url values into the new array
UPDATE public.concept_cards 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR image_urls = '{}');