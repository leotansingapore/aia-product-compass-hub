-- Add custom_gpt_link field to products table
ALTER TABLE public.products 
ADD COLUMN custom_gpt_link TEXT;