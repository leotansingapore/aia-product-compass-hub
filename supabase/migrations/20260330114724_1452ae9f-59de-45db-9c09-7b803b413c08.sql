
CREATE OR REPLACE FUNCTION public.get_learning_leaderboard(result_limit integer DEFAULT 20)
RETURNS TABLE(
  user_id text,
  display_name text,
  avatar_url text,
  quizzes_completed bigint,
  roleplays_completed bigint,
  total_activities bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    COALESCE(p.display_name, p.first_name, split_part(p.email, '@', 1), 'User') as display_name,
    p.avatar_url,
    COALESCE(q.quiz_count, 0) as quizzes_completed,
    COALESCE(r.roleplay_count, 0) as roleplays_completed,
    COALESCE(q.quiz_count, 0) + COALESCE(r.roleplay_count, 0) as total_activities
  FROM profiles p
  LEFT JOIN (
    SELECT qa.user_id::text as uid, COUNT(*)::bigint as quiz_count
    FROM quiz_attempts qa
    GROUP BY qa.user_id
  ) q ON q.uid = p.user_id
  LEFT JOIN (
    SELECT rs.user_id::text as uid, COUNT(*)::bigint as roleplay_count
    FROM roleplay_sessions rs
    GROUP BY rs.user_id
  ) r ON r.uid = p.user_id
  WHERE COALESCE(q.quiz_count, 0) + COALESCE(r.roleplay_count, 0) > 0
  ORDER BY total_activities DESC, quizzes_completed DESC
  LIMIT result_limit;
$$;
