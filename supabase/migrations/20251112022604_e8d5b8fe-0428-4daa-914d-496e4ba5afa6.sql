
-- Upgrade Master Admins to advanced tier for full access
UPDATE user_access_tiers 
SET tier_level = 'advanced' 
WHERE user_id IN (
  'dc9489e6-ab42-49a8-b83c-a85e3ded1463',  -- admin@demo.com
  '56e0d457-2a37-457f-8e65-f9bc05c09f56'   -- tanjunsing@gmail.com
);

-- Ensure tanjunsing@gmail.com also has master_admin role
UPDATE user_admin_roles 
SET admin_role = 'master_admin' 
WHERE user_id = '56e0d457-2a37-457f-8e65-f9bc05c09f56';

-- Update has_tier_access function to make master_admin bypass tier checks
CREATE OR REPLACE FUNCTION public.has_tier_access(user_id uuid, required_tier text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    CASE 
      WHEN public.has_role(user_id, 'master_admin') THEN true
      WHEN required_tier = 'basic' THEN true
      WHEN required_tier = 'intermediate' THEN public.get_user_access_tier(user_id) IN ('intermediate', 'advanced')
      WHEN required_tier = 'advanced' THEN public.get_user_access_tier(user_id) = 'advanced'
      ELSE false
    END
$$;
