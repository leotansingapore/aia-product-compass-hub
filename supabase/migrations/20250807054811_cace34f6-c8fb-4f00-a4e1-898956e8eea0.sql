-- Create master admin account for tanjunsing@gmail.com
-- First create a profile entry for this email if it doesn't exist
INSERT INTO public.profiles (user_id, email, first_name, last_name, display_name)
VALUES (
    gen_random_uuid(), 
    'tanjunsing@gmail.com', 
    'Admin', 
    'User', 
    'System Administrator'
)
ON CONFLICT (email) DO UPDATE SET
    display_name = 'System Administrator',
    first_name = 'Admin',
    last_name = 'User';

-- Now assign master_admin role
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'master_admin'
FROM public.profiles p 
WHERE p.email = 'tanjunsing@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;