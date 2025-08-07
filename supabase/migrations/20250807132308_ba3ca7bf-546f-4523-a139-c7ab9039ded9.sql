-- Drop the existing function and recreate it with proper return type
DROP FUNCTION IF EXISTS public.approve_user_request_simple(uuid, uuid, uuid);

-- Recreate the function with jsonb return type for better error handling
CREATE OR REPLACE FUNCTION public.approve_user_request_simple(request_id uuid, new_user_id uuid, approving_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    request_record record;
    result jsonb;
BEGIN
    -- Check if the approving user has permission to approve requests
    IF NOT (has_role(approving_user_id, 'admin'::text) OR has_role(approving_user_id, 'master_admin'::text)) THEN
        RAISE EXCEPTION 'Insufficient permissions to approve user requests';
    END IF;

    -- Get the request details
    SELECT * INTO request_record 
    FROM public.user_approval_requests 
    WHERE id = request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Request not found or already processed');
    END IF;
    
    -- Create profile for the new user (only if it doesn't exist)
    INSERT INTO public.profiles (user_id, email, first_name, last_name, display_name)
    VALUES (
        new_user_id,
        request_record.email,
        request_record.first_name,
        request_record.last_name,
        COALESCE(request_record.first_name || ' ' || request_record.last_name, 'User')
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        display_name = EXCLUDED.display_name;
    
    -- Assign default user role (only if it doesn't exist)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update request status
    UPDATE public.user_approval_requests 
    SET 
        status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = approving_user_id
    WHERE id = request_id;
    
    result := jsonb_build_object(
        'success', true,
        'message', 'User approved successfully',
        'email', request_record.email,
        'user_id', new_user_id,
        'profile_created', true
    );
    
    RETURN result;
END;
$$;