-- Add video recording and mentor review capabilities

-- Add video recording fields to roleplay_sessions
ALTER TABLE public.roleplay_sessions 
ADD COLUMN video_url TEXT,
ADD COLUMN recording_status TEXT DEFAULT 'pending' CHECK (recording_status IN ('pending', 'recording', 'completed', 'failed', 'not_recorded')),
ADD COLUMN video_duration_seconds INTEGER,
ADD COLUMN recording_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN recording_completed_at TIMESTAMP WITH TIME ZONE;

-- Create mentor_reviews table
CREATE TABLE public.mentor_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.roleplay_sessions(id),
  mentor_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  mentor_feedback TEXT,
  mentor_score INTEGER CHECK (mentor_score >= 1 AND mentor_score <= 10),
  mentor_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor_annotations table for timestamped feedback
CREATE TABLE public.mentor_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.mentor_reviews(id),
  timestamp_seconds INTEGER NOT NULL,
  annotation_type TEXT NOT NULL CHECK (annotation_type IN ('praise', 'improvement', 'note', 'question')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_annotations ENABLE ROW LEVEL SECURITY;

-- Create policies for mentor_reviews
CREATE POLICY "Users can view reviews of their sessions" 
ON public.mentor_reviews 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.roleplay_sessions 
  WHERE roleplay_sessions.id = mentor_reviews.session_id 
  AND roleplay_sessions.user_id = auth.uid()
));

CREATE POLICY "Mentors can view assigned reviews" 
ON public.mentor_reviews 
FOR SELECT 
USING (auth.uid() = mentor_id OR has_role(auth.uid(), 'mentor') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Mentors can update assigned reviews" 
ON public.mentor_reviews 
FOR UPDATE 
USING (auth.uid() = mentor_id OR has_role(auth.uid(), 'mentor') OR has_role(auth.uid(), 'master_admin'));

CREATE POLICY "Admins can manage all reviews" 
ON public.mentor_reviews 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'master_admin'));

-- Create policies for mentor_annotations
CREATE POLICY "Users can view annotations of their sessions" 
ON public.mentor_annotations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.mentor_reviews mr
  JOIN public.roleplay_sessions rs ON rs.id = mr.session_id
  WHERE mr.id = mentor_annotations.review_id 
  AND rs.user_id = auth.uid()
));

CREATE POLICY "Mentors can manage annotations" 
ON public.mentor_annotations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.mentor_reviews mr
  WHERE mr.id = mentor_annotations.review_id 
  AND (mr.mentor_id = auth.uid() OR has_role(auth.uid(), 'mentor') OR has_role(auth.uid(), 'master_admin'))
));

-- Add updated_at triggers
CREATE TRIGGER update_mentor_reviews_updated_at
  BEFORE UPDATE ON public.mentor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add mentor role to user_roles if it doesn't exist
INSERT INTO public.user_roles (user_id, role)
SELECT auth.uid(), 'mentor'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'mentor'
) AND auth.uid() IS NOT NULL;

-- Create indexes for performance
CREATE INDEX idx_mentor_reviews_session_id ON public.mentor_reviews(session_id);
CREATE INDEX idx_mentor_reviews_mentor_id ON public.mentor_reviews(mentor_id);
CREATE INDEX idx_mentor_reviews_status ON public.mentor_reviews(status);
CREATE INDEX idx_mentor_annotations_review_id ON public.mentor_annotations(review_id);
CREATE INDEX idx_mentor_annotations_timestamp ON public.mentor_annotations(timestamp_seconds);