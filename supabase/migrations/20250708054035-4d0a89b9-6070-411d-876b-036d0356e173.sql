-- Add useful_links column to products table
ALTER TABLE public.products 
ADD COLUMN useful_links JSONB DEFAULT '[]'::jsonb;