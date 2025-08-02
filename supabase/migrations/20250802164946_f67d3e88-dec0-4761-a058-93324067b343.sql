-- Enhanced speech analysis tables
CREATE TABLE public.speech_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.roleplay_sessions(id) ON DELETE CASCADE,
  timestamp_offset INTEGER NOT NULL, -- milliseconds from session start
  words_per_minute DECIMAL(5,2),
  filler_word_count INTEGER DEFAULT 0,
  speaking_time_ms INTEGER DEFAULT 0,
  pause_duration_ms INTEGER DEFAULT 0,
  energy_level DECIMAL(3,2), -- 0.0 to 1.0
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Store actual conversation transcripts
CREATE TABLE public.conversation_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.roleplay_sessions(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL, -- 'user' or 'ai'
  text TEXT NOT NULL,
  timestamp_offset INTEGER NOT NULL, -- milliseconds from session start
  confidence DECIMAL(3,2), -- speech-to-text confidence 0.0 to 1.0
  filler_words TEXT[], -- array of detected filler words
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Real-time coaching events
CREATE TABLE public.coaching_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.roleplay_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'filler_warning', 'pace_slow', 'pace_fast', 'energy_low'
  message TEXT NOT NULL,
  timestamp_offset INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.speech_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own speech metrics" 
ON public.speech_metrics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.roleplay_sessions rs 
  WHERE rs.id = speech_metrics.session_id AND rs.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own speech metrics" 
ON public.speech_metrics 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.roleplay_sessions rs 
  WHERE rs.id = speech_metrics.session_id AND rs.user_id = auth.uid()
));

CREATE POLICY "Users can view their own transcripts" 
ON public.conversation_transcripts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.roleplay_sessions rs 
  WHERE rs.id = conversation_transcripts.session_id AND rs.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own transcripts" 
ON public.conversation_transcripts 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.roleplay_sessions rs 
  WHERE rs.id = conversation_transcripts.session_id AND rs.user_id = auth.uid()
));

CREATE POLICY "Users can view their own coaching events" 
ON public.coaching_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.roleplay_sessions rs 
  WHERE rs.id = coaching_events.session_id AND rs.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own coaching events" 
ON public.coaching_events 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.roleplay_sessions rs 
  WHERE rs.id = coaching_events.session_id AND rs.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_speech_metrics_session_id ON public.speech_metrics(session_id);
CREATE INDEX idx_conversation_transcripts_session_id ON public.conversation_transcripts(session_id);
CREATE INDEX idx_coaching_events_session_id ON public.coaching_events(session_id);
CREATE INDEX idx_speech_metrics_timestamp ON public.speech_metrics(session_id, timestamp_offset);
CREATE INDEX idx_transcripts_timestamp ON public.conversation_transcripts(session_id, timestamp_offset);