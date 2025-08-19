-- Add useful_links column to categories table
ALTER TABLE public.categories 
ADD COLUMN useful_links JSONB DEFAULT '[]'::jsonb;