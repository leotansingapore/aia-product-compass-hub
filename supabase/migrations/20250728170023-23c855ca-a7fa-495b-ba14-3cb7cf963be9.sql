-- Add the missing test user profile
INSERT INTO public.profiles (user_id, email, first_name, last_name, display_name)
VALUES (
    '54b71065-9a3b-4199-b806-16a2c9c87197'::uuid,
    'user@demo.com',
    'Test',
    'User',
    'Test User'
);

-- Add basic user role for the test user
INSERT INTO public.user_roles (user_id, role)
VALUES ('54b71065-9a3b-4199-b806-16a2c9c87197'::uuid, 'user')
ON CONFLICT (user_id, role) DO NOTHING;