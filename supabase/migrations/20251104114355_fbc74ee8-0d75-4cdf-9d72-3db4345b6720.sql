-- Add auth_user_id column to link approval requests to auth accounts
ALTER TABLE public.user_approval_requests 
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX idx_approval_auth_user ON public.user_approval_requests(auth_user_id);

-- Add comment for documentation
COMMENT ON COLUMN public.user_approval_requests.auth_user_id IS 
'Links to the auth.users account created during signup. Account is inactive (email_confirmed=false) until admin approval.';