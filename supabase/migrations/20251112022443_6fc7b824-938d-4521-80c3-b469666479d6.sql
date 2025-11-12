
-- Phase 1: Remove duplicate admin roles, keep highest priority
WITH ranked_roles AS (
  SELECT 
    id,
    user_id,
    admin_role,
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY 
        CASE admin_role 
          WHEN 'master_admin' THEN 5
          WHEN 'admin' THEN 4
          WHEN 'consultant' THEN 3
          WHEN 'mentor' THEN 2
          WHEN 'user' THEN 1
          ELSE 0
        END DESC,
        created_at ASC
    ) as rn
  FROM user_admin_roles
)
DELETE FROM user_admin_roles
WHERE id IN (
  SELECT id FROM ranked_roles WHERE rn > 1
);

-- Phase 2: Add unique constraint to prevent future duplicates
ALTER TABLE user_admin_roles 
ADD CONSTRAINT unique_user_admin_role UNIQUE (user_id);

-- Phase 3: Update has_role() function to check user_admin_roles instead of user_roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_admin_roles
    WHERE user_id = _user_id::text AND admin_role = _role
  )
$$;

-- Phase 4: Assign default 'user' role to any NULL admin_roles
UPDATE user_admin_roles 
SET admin_role = 'user' 
WHERE admin_role IS NULL;

-- Phase 5: Assign default 'basic' tier to any NULL tier_levels
UPDATE user_access_tiers 
SET tier_level = 'basic' 
WHERE tier_level IS NULL;

-- Phase 6: Ensure all profiles have an admin role entry
INSERT INTO user_admin_roles (user_id, admin_role)
SELECT p.user_id, 'user'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_admin_roles uar WHERE uar.user_id = p.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- Phase 7: Ensure all profiles have an access tier entry
INSERT INTO user_access_tiers (user_id, tier_level)
SELECT p.user_id, 'basic'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_access_tiers uat WHERE uat.user_id = p.user_id
)
ON CONFLICT (user_id) DO NOTHING;
