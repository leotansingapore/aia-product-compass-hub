-- Remove the stored_password column from user_approval_requests table
-- This is a critical security fix - passwords should never be stored in application tables

ALTER TABLE public.user_approval_requests 
DROP COLUMN IF EXISTS stored_password;

-- Update any existing notes that referenced passwords
UPDATE public.user_approval_requests 
SET notes = 'Account approved and awaiting provisioning'
WHERE notes LIKE '%Password%' OR notes LIKE '%password%';