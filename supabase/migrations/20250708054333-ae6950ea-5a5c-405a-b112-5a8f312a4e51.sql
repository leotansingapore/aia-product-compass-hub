-- Add training_videos column to products table
ALTER TABLE public.products 
ADD COLUMN training_videos JSONB DEFAULT '[]'::jsonb;