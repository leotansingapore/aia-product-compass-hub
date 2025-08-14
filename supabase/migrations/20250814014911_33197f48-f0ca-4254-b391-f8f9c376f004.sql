-- Phase 1: Fix Critical Security Issues

-- 1. Fix RLS Policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE POLICY "Service role can manage profiles" 
ON public.profiles 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- 2. Fix RLS Policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Create proper RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text))
WITH CHECK (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text));

CREATE POLICY "Service role can manage roles" 
ON public.user_roles 
FOR ALL 
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- 3. Secure Database Functions with proper SECURITY DEFINER SET search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id::text AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_tier(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_roles.user_id = user_id::text
    AND role IN ('basic', 'intermediate', 'advanced', 'master_admin', 'user', 'admin')
  ORDER BY 
    CASE role 
      WHEN 'master_admin' THEN 6
      WHEN 'admin' THEN 5
      WHEN 'advanced' THEN 4
      WHEN 'intermediate' THEN 3
      WHEN 'basic' THEN 2
      WHEN 'user' THEN 1
      ELSE 0
    END DESC
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.has_tier_access(user_id uuid, access_type text, resource_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.tier_permissions tp
    WHERE tp.tier_level = public.get_user_tier(user_id)
      AND tp.access_type = has_tier_access.access_type
      AND tp.resource_id = has_tier_access.resource_id
  ) OR public.get_user_tier(user_id) = 'master_admin'
$function$;

CREATE OR REPLACE FUNCTION public.assign_master_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.approve_user_request_simple(request_id uuid, new_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    request_record record;
BEGIN
    -- Check if the current user has permission to approve requests
    IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin')) THEN
        RAISE EXCEPTION 'Insufficient permissions to approve user requests';
    END IF;

    -- Get the request details
    SELECT * INTO request_record 
    FROM public.user_approval_requests 
    WHERE id = request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed';
    END IF;
    
    -- Create profile for the new user
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

CREATE OR REPLACE FUNCTION public.verify_user_account_status(_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    approval_record record;
    profile_record record;
    roles_array text[];
    auth_user_exists boolean := false;
    result jsonb;
BEGIN
    -- Check if the current user has permission
    IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin')) THEN
        RAISE EXCEPTION 'Insufficient permissions to verify user accounts';
    END IF;

    -- Get approval request status
    SELECT * INTO approval_record 
    FROM public.user_approval_requests 
    WHERE email = _email;
    
    -- Get profile record if exists
    SELECT * INTO profile_record 
    FROM public.profiles 
    WHERE email = _email;
    
    -- Get user roles if profile exists
    IF profile_record.user_id IS NOT NULL THEN
        SELECT array_agg(role) INTO roles_array
        FROM public.user_roles 
        WHERE user_id = profile_record.user_id;
    END IF;
    
    -- Check if user exists in auth.users (we can't directly query this, so we'll rely on profile existence)
    auth_user_exists := (profile_record.user_id IS NOT NULL);
    
    -- Build comprehensive result
    result := jsonb_build_object(
        'email', _email,
        'approval_request', 
            CASE 
                WHEN approval_record IS NOT NULL THEN
                    jsonb_build_object(
                        'exists', true,
                        'status', approval_record.status,
                        'requested_at', approval_record.requested_at,
                        'reviewed_at', approval_record.reviewed_at,
                        'reviewed_by', approval_record.reviewed_by
                    )
                ELSE
                    jsonb_build_object('exists', false)
            END,
        'profile', 
            CASE 
                WHEN profile_record IS NOT NULL THEN
                    jsonb_build_object(
                        'exists', true,
                        'user_id', profile_record.user_id,
                        'display_name', profile_record.display_name,
                        'created_at', profile_record.created_at
                    )
                ELSE
                    jsonb_build_object('exists', false)
            END,
        'auth_user_exists', auth_user_exists,
        'roles', COALESCE(roles_array, '{}'),
        'can_login', (auth_user_exists AND approval_record.status = 'approved'),
        'issues', 
            CASE 
                WHEN approval_record.status = 'approved' AND NOT auth_user_exists THEN
                    jsonb_build_array('Approved but no user account created')
                WHEN approval_record.status = 'approved' AND auth_user_exists AND array_length(roles_array, 1) IS NULL THEN
                    jsonb_build_array('User account exists but no roles assigned')
                ELSE
                    jsonb_build_array()
            END
    );
    
    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_approval_request(_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    request_record record;
    result jsonb;
BEGIN
    -- Check if the current user has permission
    IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin')) THEN
        RAISE EXCEPTION 'Insufficient permissions to reset approval requests';
    END IF;

    -- Get the current request record
    SELECT * INTO request_record 
    FROM public.user_approval_requests 
    WHERE email = _email;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'No approval request found for this email');
    END IF;
    
    -- Reset the approval request
    UPDATE public.user_approval_requests 
    SET 
        status = 'pending',
        reviewed_at = NULL,
        reviewed_by = NULL,
        updated_at = NOW()
    WHERE email = _email;
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'message', 'Approval request reset successfully',
        'email', _email,
        'previous_status', request_record.status
    );
    
    RETURN result;
END;
$function$;