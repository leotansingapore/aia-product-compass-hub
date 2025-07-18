
-- First, let's identify users who have product-categories set to hidden
-- and update all their individual product-category permissions to hidden as well

-- Update existing individual category permissions to hidden for users who have product-categories hidden
UPDATE user_section_permissions 
SET permission_type = 'hidden'
WHERE user_id IN (
  SELECT user_id 
  FROM user_section_permissions 
  WHERE section_id = 'product-categories' 
  AND permission_type = 'hidden'
)
AND section_id LIKE 'product-category-%';

-- Insert hidden permissions for individual categories if they don't exist yet
-- for users who have product-categories hidden
INSERT INTO user_section_permissions (user_id, section_id, permission_type)
SELECT DISTINCT 
  usp.user_id,
  'product-category-' || c.id,
  'hidden'
FROM user_section_permissions usp
CROSS JOIN categories c
WHERE usp.section_id = 'product-categories' 
AND usp.permission_type = 'hidden'
AND NOT EXISTS (
  SELECT 1 
  FROM user_section_permissions usp2 
  WHERE usp2.user_id = usp.user_id 
  AND usp2.section_id = 'product-category-' || c.id
);
