-- Drop all existing RLS policies on products table
DROP POLICY IF EXISTS "Anonymous users can manage products in development" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;

-- Create clear, non-conflicting RLS policies for products
-- Everyone (including anonymous users) can view products
CREATE POLICY "Everyone can view products"
ON public.products
FOR SELECT
TO public
USING (true);

-- Only authenticated users can insert products
CREATE POLICY "Authenticated users can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update products
CREATE POLICY "Authenticated users can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can delete products
CREATE POLICY "Authenticated users can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (true);

-- Drop all existing RLS policies on categories table
DROP POLICY IF EXISTS "Anyone can manage categories" ON public.categories;

-- Create clear, non-conflicting RLS policies for categories
-- Everyone (including anonymous users) can view categories
CREATE POLICY "Everyone can view categories"
ON public.categories
FOR SELECT
TO public
USING (true);

-- Only authenticated users can insert categories
CREATE POLICY "Authenticated users can insert categories"
ON public.categories
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update categories
CREATE POLICY "Authenticated users can update categories"
ON public.categories
FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can delete categories
CREATE POLICY "Authenticated users can delete categories"
ON public.categories
FOR DELETE
TO authenticated
USING (true);