-- Remove the trigger from auth schema (not best practice)
DROP TRIGGER IF EXISTS on_auth_user_password_change ON auth.users;