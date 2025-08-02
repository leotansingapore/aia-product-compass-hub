-- Create roleplay sessions table
CREATE TABLE public.roleplay_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario_title TEXT NOT NULL,
  scenario_category TEXT NOT NULL,
  scenario_difficulty TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  tavus_conversation_id TEXT,
  transcript JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roleplay feedback table
CREATE TABLE public.roleplay_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.roleplay_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  communication_score INTEGER NOT NULL CHECK (communication_score >= 0 AND communication_score <= 100),
  listening_score INTEGER NOT NULL CHECK (listening_score >= 0 AND listening_score <= 100),
  objection_handling_score INTEGER NOT NULL CHECK (objection_handling_score >= 0 AND objection_handling_score <= 100),
  product_knowledge_score INTEGER NOT NULL CHECK (product_knowledge_score >= 0 AND product_knowledge_score <= 100),
  strengths TEXT[],
  improvement_areas TEXT[],
  specific_feedback TEXT NOT NULL,
  coaching_points TEXT[],
  follow_up_questions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roleplay performance metrics table
CREATE TABLE public.roleplay_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.roleplay_sessions(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  metric_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roleplay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleplay_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleplay_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for roleplay_sessions
CREATE POLICY "Users can view their own roleplay sessions"
ON public.roleplay_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roleplay sessions"
ON public.roleplay_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roleplay sessions"
ON public.roleplay_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policies for roleplay_feedback
CREATE POLICY "Users can view feedback for their sessions"
ON public.roleplay_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.roleplay_sessions 
    WHERE roleplay_sessions.id = roleplay_feedback.session_id 
    AND roleplay_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage feedback"
ON public.roleplay_feedback
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- Create policies for roleplay_performance_metrics
CREATE POLICY "Users can view metrics for their sessions"
ON public.roleplay_performance_metrics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.roleplay_sessions 
    WHERE roleplay_sessions.id = roleplay_performance_metrics.session_id 
    AND roleplay_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage metrics"
ON public.roleplay_performance_metrics
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_roleplay_sessions_updated_at
BEFORE UPDATE ON public.roleplay_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();