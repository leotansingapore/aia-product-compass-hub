-- Disable email confirmation for easier testing
UPDATE auth.config 
SET email_confirm_change = false, 
    email_autoconfirm = true, 
    email_enable_signup = true,
    email_enable_confirmations = false
WHERE id = 1;

-- Also ensure the demo user profile can be created without RLS issues
-- by temporarily allowing profile creation for the demo account