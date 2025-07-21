-- Create a new admin user account via direct insertion
-- This bypasses normal signup and creates a working admin account

-- First, let's create the auth user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@lovable.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO UPDATE SET
    encrypted_password = crypt('admin123', gen_salt('bf')),
    updated_at = NOW();

-- Get the user ID and assign master admin role
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@lovable.com';
    
    -- Assign master admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'master_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Create profile
    INSERT INTO public.profiles (user_id, email, first_name, last_name, display_name)
    VALUES (
        admin_user_id, 
        'admin@lovable.com', 
        'Admin', 
        'User', 
        'Administrator'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        display_name = EXCLUDED.display_name;
END $$;