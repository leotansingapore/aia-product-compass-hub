
-- Add published column to categories
ALTER TABLE categories ADD COLUMN published boolean NOT NULL DEFAULT false;
UPDATE categories SET published = true;

-- Add published column to products
ALTER TABLE products ADD COLUMN published boolean NOT NULL DEFAULT false;
UPDATE products SET published = true;

-- Update RLS: non-admins only see published categories
DROP POLICY "Everyone can view categories" ON categories;
CREATE POLICY "Everyone can view categories" ON categories
  FOR SELECT USING (
    published = true
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'master_admin')
  );

-- Update RLS: non-admins only see published products
DROP POLICY "Everyone can view products" ON products;
CREATE POLICY "Everyone can view products" ON products
  FOR SELECT USING (
    published = true
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'master_admin')
  );
