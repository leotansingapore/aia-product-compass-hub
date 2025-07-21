-- Add assistant_id field to products table to store unique OpenAI Assistant IDs
ALTER TABLE public.products 
ADD COLUMN assistant_id TEXT;

-- Add assistant_instructions field to store product-specific instructions
ALTER TABLE public.products 
ADD COLUMN assistant_instructions TEXT;