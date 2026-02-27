
CREATE TABLE public.pitch_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL DEFAULT 'pro-achiever',
  video_url TEXT NOT NULL,
  video_title TEXT,
  transcript TEXT,
  transcript_source TEXT, -- 'loom' | 'youtube' | 'manual'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'transcribing' | 'analysing' | 'completed' | 'failed'
  error_message TEXT,
  -- Scores (1-10)
  overall_score NUMERIC(4,1),
  product_knowledge_score NUMERIC(4,1),
  needs_discovery_score NUMERIC(4,1),
  objection_handling_score NUMERIC(4,1),
  closing_technique_score NUMERIC(4,1),
  communication_score NUMERIC(4,1),
  -- Feedback content
  executive_summary TEXT,
  strengths JSONB,
  improvement_areas JSONB,
  missed_key_points JSONB,
  recommended_follow_up JSONB,
  detailed_rubric JSONB,
  raw_feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pitch_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pitch analyses"
  ON public.pitch_analyses FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own pitch analyses"
  ON public.pitch_analyses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own pitch analyses"
  ON public.pitch_analyses FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE TRIGGER update_pitch_analyses_updated_at
  BEFORE UPDATE ON public.pitch_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
