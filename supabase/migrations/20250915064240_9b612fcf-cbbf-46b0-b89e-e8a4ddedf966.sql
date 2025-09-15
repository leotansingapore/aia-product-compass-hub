-- Upgrade existing users who only have 'user' role to also have 'basic' tier
-- This makes all existing users "active" by default

-- Insert 'basic' role for users who only have 'user' role and no tier
INSERT INTO public.user_roles (user_id, role)
SELECT ur.user_id, 'basic'
FROM public.user_roles ur
WHERE ur.role = 'user'
  AND NOT EXISTS (
    SELECT 1 
    FROM public.user_roles ur2 
    WHERE ur2.user_id = ur.user_id 
      AND ur2.role IN ('basic', 'intermediate', 'advanced', 'admin', 'master_admin')
  )
ON CONFLICT (user_id, role) DO NOTHING;