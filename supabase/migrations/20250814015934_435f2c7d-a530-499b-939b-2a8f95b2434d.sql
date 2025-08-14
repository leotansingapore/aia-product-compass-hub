-- Fix remaining security functions only (no auth.users creation)
-- Just fix the two clerk-related functions that need proper security

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