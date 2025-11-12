-- Drop the existing check constraint that's blocking the migration
ALTER TABLE user_access_tiers DROP CONSTRAINT IF EXISTS valid_tier_level;

-- Phase 7: Data Migration (do this after dropping constraint)
-- Move basic → level_1
UPDATE user_access_tiers SET tier_level = 'level_1' WHERE tier_level = 'basic';

-- Move intermediate/advanced → level_2  
UPDATE user_access_tiers SET tier_level = 'level_2' WHERE tier_level IN ('intermediate', 'advanced');

-- Remove orphaned tier rows (admin roles should not be in access tiers)
DELETE FROM user_access_tiers WHERE tier_level IN ('user', 'admin', 'master_admin');

-- Add new check constraint that allows only level_1 and level_2
ALTER TABLE user_access_tiers 
ADD CONSTRAINT valid_tier_level 
CHECK (tier_level IN ('level_1', 'level_2'));

-- Phase 1: Clean up tier_permissions table
-- Delete all rows for removed tiers
DELETE FROM tier_permissions WHERE tier_level IN ('basic', 'intermediate', 'advanced', 'user', 'admin', 'master_admin');

-- Phase 2: Register Missing Pages in app_pages
INSERT INTO app_pages (id, name, description, path, category) VALUES
('product-detail', 'Product Detail', 'Individual product information pages', '/product/:productSlugOrId', 'products'),
('product-category', 'Product Category', 'Product category listing pages', '/category/:categorySlugOrId', 'products'),
('cmfas-module-detail', 'CMFAS Module Detail', 'Individual CMFAS module pages', '/cmfas/module/:moduleId', 'cmfas'),
('cmfas-video-detail', 'CMFAS Video Detail', 'Individual CMFAS video pages', '/cmfas/module/:moduleId/video/:videoSlugOrId', 'cmfas'),
('cmfas-chat', 'CMFAS Chat', 'CMFAS AI tutor chat', '/cmfas/chat/:moduleId?', 'cmfas')
ON CONFLICT (id) DO NOTHING;

-- Phase 3: Set Up Tier Permissions

-- Delete existing permissions to start fresh
DELETE FROM tier_permissions WHERE tier_level IN ('level_1', 'level_2');

-- Level 1 (CMFAS Only) - Insert CMFAS pages only
INSERT INTO tier_permissions (tier_level, access_type, resource_id) VALUES
('level_1', 'page', 'cmfas-exams'),
('level_1', 'page', 'cmfas-module-detail'),
('level_1', 'page', 'cmfas-video-detail'),
('level_1', 'page', 'cmfas-chat');

-- Level 2 (Everything) - Insert all CMFAS pages + product pages + roleplay
INSERT INTO tier_permissions (tier_level, access_type, resource_id) VALUES
-- All CMFAS pages
('level_2', 'page', 'cmfas-exams'),
('level_2', 'page', 'cmfas-module-detail'),
('level_2', 'page', 'cmfas-video-detail'),
('level_2', 'page', 'cmfas-chat'),
-- Product pages
('level_2', 'page', 'product-detail'),
('level_2', 'page', 'product-category'),
-- Roleplay
('level_2', 'page', 'roleplay'),
-- All sections
('level_2', 'section', 'product-categories'),
('level_2', 'section', 'product_videos'),
('level_2', 'section', 'product_links'),
('level_2', 'section', 'product_notes'),
('level_2', 'section', 'product_chat_assistance');

-- Phase 4: Update User Tier Assignment for jhinnkhada00@gmail.com
-- Update to level_2 (Everything access)
UPDATE user_access_tiers 
SET tier_level = 'level_2', updated_at = now()
WHERE user_id = '6c4de0d9-6468-4123-9e99-ad4b4ade8871';

-- If the user doesn't have a tier record, create one
INSERT INTO user_access_tiers (user_id, tier_level, granted_by)
SELECT '6c4de0d9-6468-4123-9e99-ad4b4ade8871', 'level_2', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM user_access_tiers WHERE user_id = '6c4de0d9-6468-4123-9e99-ad4b4ade8871'
);