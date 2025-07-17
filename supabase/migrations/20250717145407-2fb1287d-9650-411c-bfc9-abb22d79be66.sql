-- Create a function to assign master admin role to a user
CREATE OR REPLACE FUNCTION public.assign_master_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user ID from the auth.users table using email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = user_email
    LIMIT 1;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Insert master_admin role if it doesn't exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'master_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Create or update profile for this user
    INSERT INTO public.profiles (user_id, email, first_name, last_name, display_name)
    VALUES (
        target_user_id, 
        user_email, 
        'Master', 
        'Admin', 
        'Master Administrator'
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        display_name = EXCLUDED.display_name;
END;
$$;