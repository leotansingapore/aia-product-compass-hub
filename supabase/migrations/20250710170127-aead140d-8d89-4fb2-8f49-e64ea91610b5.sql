-- Confirm the demo user email manually to bypass email confirmation
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email = 'admin@demo.com';