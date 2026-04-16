CREATE OR REPLACE FUNCTION public.get_user_access_tier(user_id uuid)
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(tier_level, 'explorer')
  FROM public.user_access_tiers 
  WHERE user_access_tiers.user_id = $1::text
  ORDER BY updated_at DESC
  LIMIT 1;
$$;