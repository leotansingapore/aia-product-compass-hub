-- Add parent_product_id to products table for nested sub-module support
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS parent_product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL;

-- Index for fast lookup of children
CREATE INDEX IF NOT EXISTS idx_products_parent_product_id ON public.products(parent_product_id);

-- Add sort_order for controlling order of sub-modules within a parent
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;