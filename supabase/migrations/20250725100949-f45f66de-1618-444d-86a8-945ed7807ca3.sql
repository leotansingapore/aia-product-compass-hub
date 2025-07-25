-- First, create a temporary "Learning Modules" category to hold CMFAS products
INSERT INTO categories (id, name, description)
VALUES (
  gen_random_uuid(),
  'Learning Modules',
  'Educational modules and training content'
) ON CONFLICT (name) DO NOTHING;

-- Move CMFAS products to the Learning Modules category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Learning Modules')
WHERE category_id = (SELECT id FROM categories WHERE name = 'CMFAS Modules');

-- Now safely delete the CMFAS Modules category
DELETE FROM categories WHERE name = 'CMFAS Modules';