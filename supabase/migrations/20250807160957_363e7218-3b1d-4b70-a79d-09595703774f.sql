-- Update the tier system from tier_1/2/3/4 to basic/intermediate/advanced
-- and set up the new permission structure

-- First, add the roleplay page to app_pages if it doesn't exist
INSERT INTO public.app_pages (id, name, description, path, category)
VALUES ('roleplay', 'Roleplay Training', 'Interactive roleplay scenarios for practice', '/roleplay', 'training')
ON CONFLICT (id) DO NOTHING;

-- Clear existing tier permissions to rebuild with new structure
DELETE FROM public.tier_permissions;

-- Set up new tier permissions structure
-- Basic tier: Only CMFAS exams
INSERT INTO public.tier_permissions (tier_level, access_type, resource_id) VALUES
('basic', 'page', 'cmfas-exams');

-- Intermediate tier: CMFAS exams + roleplay
INSERT INTO public.tier_permissions (tier_level, access_type, resource_id) VALUES
('intermediate', 'page', 'cmfas-exams'),
('intermediate', 'page', 'roleplay');

-- Advanced tier: CMFAS exams + roleplay + all product categories
INSERT INTO public.tier_permissions (tier_level, access_type, resource_id) VALUES
('advanced', 'page', 'cmfas-exams'),
('advanced', 'page', 'roleplay'),
('advanced', 'section', 'product-categories'),
('advanced', 'page', 'product-category');

-- Migrate existing user roles from old tier system to new system
-- tier_1 -> basic, tier_2 -> intermediate, tier_3 -> advanced, tier_4 -> advanced
UPDATE public.user_roles 
SET role = CASE 
  WHEN role = 'tier_1' THEN 'basic'
  WHEN role = 'tier_2' THEN 'intermediate' 
  WHEN role = 'tier_3' THEN 'advanced'
  WHEN role = 'tier_4' THEN 'advanced'
  ELSE role
END
WHERE role IN ('tier_1', 'tier_2', 'tier_3', 'tier_4');

-- Update the get_user_tier function to handle new tier levels
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_roles.user_id = user_id::text
    AND role IN ('basic', 'intermediate', 'advanced', 'master_admin', 'user', 'admin')
  ORDER BY 
    CASE role 
      WHEN 'master_admin' THEN 6
      WHEN 'admin' THEN 5
      WHEN 'advanced' THEN 4
      WHEN 'intermediate' THEN 3
      WHEN 'basic' THEN 2
      WHEN 'user' THEN 1
      ELSE 0
    END DESC
  LIMIT 1
$function$;