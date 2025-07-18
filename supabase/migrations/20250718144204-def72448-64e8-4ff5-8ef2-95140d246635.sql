
-- Add the missing product-categories permission for the user
INSERT INTO user_section_permissions (user_id, section_id, permission_type, lock_message)
VALUES ('ab46f9d3-c290-4f06-9042-a9c06cdefe55', 'product-categories', 'hidden', 'Category access restricted')
ON CONFLICT (user_id, section_id) DO UPDATE SET
  permission_type = 'hidden',
  lock_message = 'Category access restricted';

-- Add hidden permissions for all individual product categories for this user
INSERT INTO user_section_permissions (user_id, section_id, permission_type, lock_message)
SELECT 
  'ab46f9d3-c290-4f06-9042-a9c06cdefe55',
  'product-category-' || c.id,
  'hidden',
  'Category access restricted'
FROM categories c
WHERE NOT EXISTS (
  SELECT 1 
  FROM user_section_permissions usp 
  WHERE usp.user_id = 'ab46f9d3-c290-4f06-9042-a9c06cdefe55'
  AND usp.section_id = 'product-category-' || c.id
);
