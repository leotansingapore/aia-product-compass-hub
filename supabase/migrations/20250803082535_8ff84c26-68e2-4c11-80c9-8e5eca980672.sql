-- Add new scoring fields to roleplay_feedback table
ALTER TABLE public.roleplay_feedback 
ADD COLUMN small_talk_score integer,
ADD COLUMN pain_point_identification_score integer,
ADD COLUMN tone_analysis text[],
ADD COLUMN visual_presence_analysis text[],
ADD COLUMN pronunciation_feedback text,
ADD COLUMN conversation_summary text;

-- Rename listening_score to active_listening_score for consistency
ALTER TABLE public.roleplay_feedback 
RENAME COLUMN listening_score TO active_listening_score;