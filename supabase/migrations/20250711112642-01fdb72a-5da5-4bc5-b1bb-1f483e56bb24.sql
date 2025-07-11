-- Create user approval requests table
CREATE TABLE public.user_approval_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_approval_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for user approval requests
CREATE POLICY "Anyone can create approval requests" 
ON public.user_approval_requests 
FOR INSERT 
USING (true);

CREATE POLICY "Users can view their own requests" 
ON public.user_approval_requests 
FOR SELECT 
USING (email = (auth.jwt() ->> 'email'));

-- Add trigger for updated_at
CREATE TRIGGER update_user_approval_requests_updated_at
BEFORE UPDATE ON public.user_approval_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();