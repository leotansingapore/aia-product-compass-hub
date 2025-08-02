-- Create function to create roleplay session
CREATE OR REPLACE FUNCTION public.create_roleplay_session(
  scenario_title text,
  scenario_category text,
  scenario_difficulty text,
  tavus_conversation_id text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_session_id uuid;
BEGIN
  INSERT INTO public.roleplay_sessions (
    user_id,
    scenario_title,
    scenario_category,
    scenario_difficulty,
    tavus_conversation_id
  ) VALUES (
    auth.uid(),
    scenario_title,
    scenario_category,
    scenario_difficulty,
    tavus_conversation_id
  )
  RETURNING id INTO new_session_id;
  
  RETURN new_session_id;
END;
$$;

-- Create function to update roleplay session
CREATE OR REPLACE FUNCTION public.update_roleplay_session(
  session_id uuid,
  end_time timestamp with time zone,
  duration integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.roleplay_sessions 
  SET 
    ended_at = end_time,
    duration_seconds = duration,
    updated_at = now()
  WHERE id = session_id 
    AND user_id = auth.uid();
END;
$$;