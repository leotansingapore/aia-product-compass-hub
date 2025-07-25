-- Create a Learning Modules category if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Learning Modules') THEN
    INSERT INTO categories (id, name, description)
    VALUES (
      gen_random_uuid(),
      'Learning Modules',
      'Educational modules and training content'
    );
  END IF;
END $$;

-- Move CMFAS products to the Learning Modules category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE name = 'Learning Modules')
WHERE category_id = (SELECT id FROM categories WHERE name = 'CMFAS Modules');

-- Now safely delete the CMFAS Modules category
DELETE FROM categories WHERE name = 'CMFAS Modules';