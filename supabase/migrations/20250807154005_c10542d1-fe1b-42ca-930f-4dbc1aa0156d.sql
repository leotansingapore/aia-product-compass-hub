-- Check if user@demo.com exists and if not, create it
DO $$
DECLARE
    user_exists INTEGER;
    new_user_id UUID;
BEGIN
    -- Check if user already exists
    SELECT COUNT(*) INTO user_exists FROM auth.users WHERE email = 'user@demo.com';
    
    IF user_exists = 0 THEN
        -- Generate new UUID for the user
        new_user_id := gen_random_uuid();
        
        -- Create the user account
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_sent_at,
            recovery_token,
            reauthentication_token,
            reauthentication_sent_at,
            is_super_admin,
            deleted_at,
            is_sso_user,
            is_anonymous
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'user@demo.com',
            crypt('demo123456', gen_salt('bf')),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"display_name": "Demo User"}',
            NOW(),
            NOW(),
            '',
            '',
            NULL,
            '',
            '',
            NULL,
            false,
            NULL,
            false,
            false
        );
        
        -- Create profile
        INSERT INTO public.profiles (user_id, email, display_name, first_name, last_name)
        VALUES (
            new_user_id::text,
            'user@demo.com',
            'Demo User',
            'Demo',
            'User'
        );
        
        -- Assign user role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (new_user_id::text, 'user');
        
        RAISE NOTICE 'Created user@demo.com with ID: %', new_user_id;
    ELSE
        RAISE NOTICE 'User user@demo.com already exists';
    END IF;
END $$;