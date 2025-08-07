-- Create a simple signup approval workflow for Clerk integration
-- This will allow new users to request access but require admin approval

-- Update the user_approval_requests table to work with Clerk
-- First let's add a clerk_user_id column to track Clerk users
ALTER TABLE public.user_approval_requests 
ADD COLUMN IF NOT EXISTS clerk_user_id text;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_approval_requests_clerk_user_id 
ON public.user_approval_requests(clerk_user_id);

-- Create a simplified approval workflow for Clerk users
-- When a user signs up with Clerk, they'll need to create an approval request
-- Admins will approve/reject these requests

-- Now let's assign master admin to a real email (replace with your actual email)
-- First I need to know your email address to create the admin account