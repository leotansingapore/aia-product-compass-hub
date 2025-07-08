-- Create video_progress table to track individual video completion per user
CREATE TABLE public.video_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  watch_time_seconds INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, video_id)
);

-- Enable Row Level Security
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own video progress" 
ON public.video_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video progress" 
ON public.video_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video progress" 
ON public.video_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_progress_updated_at
BEFORE UPDATE ON public.video_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();