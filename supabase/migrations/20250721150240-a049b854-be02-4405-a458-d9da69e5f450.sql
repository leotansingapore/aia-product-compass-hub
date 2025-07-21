-- Add missing RLS policies for user approval system
CREATE POLICY "Admins can view all approval requests" 
ON public.user_approval_requests 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Admins can update approval requests" 
ON public.user_approval_requests 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));

-- Create function to approve user requests
CREATE OR REPLACE FUNCTION public.approve_user_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request_record record;
    new_user_id uuid;
BEGIN
    -- Get the request details
    SELECT * INTO request_record 
    FROM public.user_approval_requests 
    WHERE id = request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or already processed';
    END IF;
    
    -- Create the user in auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        confirmation_token,
        recovery_token,
        email_change_token_new
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        request_record.email,
        crypt('temppassword123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        '',
        '',
        ''
    )
    RETURNING id INTO new_user_id;
    
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
END;
$$;