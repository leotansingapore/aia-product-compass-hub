-- Add generation_status column to roleplay_feedback table to track feedback generation state
ALTER TABLE public.roleplay_feedback
ADD COLUMN IF NOT EXISTS generation_status text
  NOT NULL
  DEFAULT 'pending'
  CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed'));

-- Create index for faster queries by generation status
CREATE INDEX IF NOT EXISTS idx_roleplay_feedback_generation_status
ON public.roleplay_feedback(generation_status);

-- Update existing records to 'completed' status (they already have feedback)
UPDATE public.roleplay_feedback
SET generation_status = 'completed'
WHERE generation_status = 'pending'
  AND overall_score > 0;
