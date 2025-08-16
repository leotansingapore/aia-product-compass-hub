-- Rename password_hash to stored_password for clarity since we're storing plaintext temporarily
ALTER TABLE public.user_approval_requests 
RENAME COLUMN password_hash TO stored_password;