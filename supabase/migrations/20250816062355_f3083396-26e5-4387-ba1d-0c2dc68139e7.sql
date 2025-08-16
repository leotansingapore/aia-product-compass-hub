-- Add password storage column to user_approval_requests table
ALTER TABLE public.user_approval_requests 
ADD COLUMN password_hash text;

-- Create RPC function to store signup password securely
CREATE OR REPLACE FUNCTION public.store_signup_password(user_email text, user_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Store the hashed password in the approval request
  UPDATE user_approval_requests 
  SET password_hash = crypt(user_password, gen_salt('bf'))
  WHERE email = user_email AND status = 'pending';
END;
$$;

-- Create RPC function to get stored password for activation
CREATE OR REPLACE FUNCTION public.get_signup_password(user_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  -- Only service role should be able to call this
  IF current_setting('role') != 'service_role' THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT password_hash INTO stored_hash
  FROM user_approval_requests 
  WHERE email = user_email AND status = 'approved';
  
  RETURN stored_hash;
END;
$$;