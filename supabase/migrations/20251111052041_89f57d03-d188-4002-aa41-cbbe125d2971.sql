-- Fix admin role constraint and data: Replace super_admin with master_admin
-- The RLS policies and code expect 'master_admin', but the constraint only allows 'super_admin'

-- Step 1: Drop the old constraint
ALTER TABLE user_admin_roles 
DROP CONSTRAINT IF EXISTS valid_admin_role;

-- Step 2: Update data from super_admin to master_admin
UPDATE user_admin_roles 
SET admin_role = 'master_admin' 
WHERE admin_role = 'super_admin';

-- Step 3: Add new constraint with master_admin instead of super_admin
ALTER TABLE user_admin_roles 
ADD CONSTRAINT valid_admin_role 
CHECK (admin_role IN ('user', 'mentor', 'admin', 'master_admin', 'consultant'));

-- Add comment for clarity
COMMENT ON COLUMN user_admin_roles.admin_role IS 'Admin role: user (default), mentor, admin, master_admin (highest privilege), consultant';