-- Create a function to reset approval requests for admin troubleshooting
CREATE OR REPLACE FUNCTION public.reset_approval_request(_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_record record;
    result jsonb;
BEGIN
    -- Check if the current user has permission
    IF NOT (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text)) THEN
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
$$;

-- Create a function to verify user account status
CREATE OR REPLACE FUNCTION public.verify_user_account_status(_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    approval_record record;
    profile_record record;
    roles_array text[];
    auth_user_exists boolean := false;
    result jsonb;
BEGIN
    -- Check if the current user has permission
    IF NOT (has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'master_admin'::text)) THEN
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
$$;