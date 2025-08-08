-- Fix the search path issue in the handle_password_change function
CREATE OR REPLACE FUNCTION public.handle_password_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the password_changed_at timestamp and set first_login to false
  UPDATE public.profiles 
  SET 
    password_changed_at = now(),
    first_login = false,
    updated_at = now()
  WHERE user_id = NEW.id::text;
  
  RETURN NEW;
END;
$$;