-- Phase 1 completion: Fix remaining security functions
-- The remaining functions that need SECURITY DEFINER SET search_path = '' are likely from user's manual functions

-- Fix any remaining functions by redefining them with proper security settings
CREATE OR REPLACE FUNCTION public.assign_master_admin_to_clerk_user(clerk_user_id text, user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Insert profile for master admin user
    INSERT INTO public.profiles (user_id, email, display_name, first_name, last_name)
    VALUES (clerk_user_id, user_email, 'Master Administrator', 'Master', 'Admin')
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name;
    
    -- Remove any existing roles for this user first
    DELETE FROM public.user_roles WHERE user_id = clerk_user_id;
    
    -- Assign master_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (clerk_user_id, 'master_admin');
END;
$function$;

CREATE OR REPLACE FUNCTION public.upgrade_user_to_master_admin(target_user_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Remove existing roles
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Add master admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'master_admin');
    
    -- Update profile display name
    UPDATE public.profiles 
    SET display_name = 'Master Administrator'
    WHERE user_id = target_user_id;
END;
$function$;

-- Function to create demo accounts with proper roles
CREATE OR REPLACE FUNCTION public.ensure_demo_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    master_admin_id uuid;
    admin_id uuid;
    user_id uuid;
BEGIN
    -- Create master admin demo account
    SELECT id INTO master_admin_id FROM auth.users WHERE email = 'master_admin@demo.com';
    IF master_admin_id IS NULL THEN
        master_admin_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
            is_sso_user, deleted_at, is_anonymous
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', master_admin_id, 'authenticated', 'authenticated',
            'master_admin@demo.com', crypt('demo123456', gen_salt('bf')), NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"display_name": "Master Admin Demo"}'::jsonb,
            false, NOW(), NOW(), false, NULL, false
        );
    END IF;
    
    -- Create admin demo account
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@demo.com';
    IF admin_id IS NULL THEN
        admin_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
            is_sso_user, deleted_at, is_anonymous
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
            'admin@demo.com', crypt('demo123456', gen_salt('bf')), NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"display_name": "Admin Demo"}'::jsonb,
            false, NOW(), NOW(), false, NULL, false
        );
    END IF;
    
    -- Create regular user demo account
    SELECT id INTO user_id FROM auth.users WHERE email = 'user@demo.com';
    IF user_id IS NULL THEN
        user_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
            is_sso_user, deleted_at, is_anonymous
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated',
            'user@demo.com', crypt('demo123456', gen_salt('bf')), NOW(),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"display_name": "User Demo"}'::jsonb,
            false, NOW(), NOW(), false, NULL, false
        );
    END IF;
    
    -- Create/update profiles
    INSERT INTO public.profiles (user_id, email, display_name, first_name, last_name)
    VALUES 
        (master_admin_id, 'master_admin@demo.com', 'Master Admin Demo', 'Master Admin', 'Demo'),
        (admin_id, 'admin@demo.com', 'Admin Demo', 'Admin', 'Demo'),
        (user_id, 'user@demo.com', 'User Demo', 'User', 'Demo')
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name;
    
    -- Assign roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES 
        (master_admin_id, 'master_admin'),
        (admin_id, 'admin'),
        (user_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Demo accounts ensured successfully';
END;
$function$;

-- Call the function to ensure demo accounts exist
SELECT public.ensure_demo_accounts();