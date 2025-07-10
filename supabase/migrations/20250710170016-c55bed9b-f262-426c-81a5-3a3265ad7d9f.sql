-- Disable email confirmation for easier demo access
UPDATE auth.config 
SET 
  enable_confirmations = false,
  enable_signup = true
WHERE parameter = 'enable_confirmations';