-- Add new enhanced feedback fields to roleplay_feedback table
ALTER TABLE public.roleplay_feedback 
ADD COLUMN IF NOT EXISTS practice_score integer,
ADD COLUMN IF NOT EXISTS detailed_rubric_feedback jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS previous_attempt_comparison text,
ADD COLUMN IF NOT EXISTS conversation_flow_summary jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS body_language_analysis text,
ADD COLUMN IF NOT EXISTS tone_detailed_analysis text;