-- Fix RLS policies to allow admins to approve user requests

-- Update profiles table to allow admins to create profiles for new users
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::text) 
  OR has_role(auth.uid(), 'master_admin'::text)
);

-- Update user_roles table to allow admins to assign roles to new users
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (
  has_role(auth.uid(), 'master_admin'::text) 
  OR has_role(auth.uid(), 'admin'::text)
  OR current_setting('role'::text) = 'service_role'::text
)
WITH CHECK (
  has_role(auth.uid(), 'master_admin'::text) 
  OR has_role(auth.uid(), 'admin'::text)
  OR current_setting('role'::text) = 'service_role'::text
);

-- Ensure the approve_user_request function runs with proper security context
CREATE OR REPLACE FUNCTION public.approve_user_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
DECLARE
    request_record record;
    new_user_id uuid;
BEGIN
    -- Check if the current user has permission to approve requests
    IF NOT (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text)) THEN
        RAISE EXCEPTION 'Insufficient permissions to approve user requests';
    END IF;

    -- Get the request details
    SELECT * INTO request_record 
    FROM public.user_approval_requests 
    WHERE id = request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed';
    END IF;
    
    -- Generate new user ID
    new_user_id := gen_random_uuid();
    
    -- Create the user in auth.users with all required columns properly set
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at,
        is_anonymous
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        request_record.email,
        crypt('temppassword123', gen_salt('bf')),
        NOW(),
        NULL,
        '',
        NULL,
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        COALESCE(
            jsonb_build_object(
                'first_name', request_record.first_name,
                'last_name', request_record.last_name
            ),
            '{}'::jsonb
        ),
        false,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        false,
        NULL,
        false
    );
    
    -- Create profile
    INSERT INTO public.profiles (user_id, email, first_name, last_name, display_name)
    VALUES (
        new_user_id,
        request_record.email,
        request_record.first_name,
        request_record.last_name,
        COALESCE(request_record.first_name || ' ' || request_record.last_name, 'User')
    );
    
    -- Assign default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'user');
    
    -- Update request status
    UPDATE public.user_approval_requests 
    SET 
        status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = auth.uid()
    WHERE id = request_id;
    
    RAISE NOTICE 'User approved successfully: %', request_record.email;
END;
$function$;