-- Add first login tracking and password management columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN first_login boolean DEFAULT true,
ADD COLUMN password_changed_at timestamp with time zone DEFAULT null;

-- Create function to update password_changed_at when user changes password
CREATE OR REPLACE FUNCTION public.handle_password_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger to automatically update password_changed_at when auth.users password changes
CREATE TRIGGER on_password_change
  AFTER UPDATE OF encrypted_password ON auth.users
  FOR EACH ROW 
  WHEN (OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password)
  EXECUTE FUNCTION public.handle_password_change();