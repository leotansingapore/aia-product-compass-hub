-- Fix the existing user record that has NULL email_change column
UPDATE auth.users 
SET 
    email_change = '',
    phone_change = '',
    email_change_token_current = '',
    reauthentication_token = '',
    phone_change_token = ''
WHERE email = 'tanjunsing8@gmail.com' 
AND (
    email_change IS NULL 
    OR phone_change IS NULL 
    OR email_change_token_current IS NULL 
    OR reauthentication_token IS NULL 
    OR phone_change_token IS NULL
);