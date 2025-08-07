-- Create master admin account for tanjunsing@gmail.com
-- First check if profile exists and create if not
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if profile already exists
    SELECT user_id INTO admin_user_id 
    FROM public.profiles 
    WHERE email = 'tanjunsing@gmail.com';

    -- If no profile exists, create one
    IF admin_user_id IS NULL THEN
        admin_user_id := gen_random_uuid();
        INSERT INTO public.profiles (user_id, email, first_name, last_name, display_name)
        VALUES (
            admin_user_id, 
            'tanjunsing@gmail.com', 
            'Admin', 
            'User', 
            'System Administrator'
        );
    ELSE
        -- Update existing profile
        UPDATE public.profiles 
        SET 
            display_name = 'System Administrator',
            first_name = 'Admin',
            last_name = 'User'
        WHERE user_id = admin_user_id;
    END IF;

    -- Assign master_admin role (insert only if doesn't exist)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'master_admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Master admin account created/updated for tanjunsing@gmail.com with user_id: %', admin_user_id;
END $$;