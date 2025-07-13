-- Enable real-time updates for user achievements and profiles tables
ALTER TABLE public.user_achievements REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
ALTER publication supabase_realtime ADD TABLE public.user_achievements;
ALTER publication supabase_realtime ADD TABLE public.profiles;