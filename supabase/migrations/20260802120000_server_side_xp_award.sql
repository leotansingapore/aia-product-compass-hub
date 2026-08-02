-- XP was forgeable.
--
-- `useGamification` computed the XP in the browser, inserted `quiz_attempts`
-- itself, and then wrote `profiles.total_xp` / `profiles.current_level`
-- straight from the client. The own-row RLS policy on `profiles` permits that,
-- so any learner could open the console and run
--
--   supabase.from('profiles').update({ total_xp: 999999, current_level: 99 })
--                            .eq('user_id', myId)
--
-- and top the leaderboard. The "one quiz per day" limit was equally cosmetic:
-- a client SELECT followed by an unconditional client INSERT.
--
-- This migration moves every XP-bearing write behind SECURITY DEFINER
-- functions that recompute the reward from the server's own data, and then
-- removes the client's ability to write the gamification columns at all.
-- Learners keep full UPDATE rights on the columns they own (display_name,
-- first/last name, avatar, address, ...).

-- ---------------------------------------------------------------------------
-- Local calendar day
-- ---------------------------------------------------------------------------
-- `src/lib/localDay.ts` deliberately uses the LEARNER'S calendar day, not UTC:
-- in Singapore a UTC boundary rolls "today" over at 08:00 local, so an evening
-- quiz still counted as today the next morning. The database has no way to
-- know the browser's zone, so the client passes its offset
-- (`-new Date().getTimezoneOffset()`) and we clamp it to the range of real
-- world offsets. A forged offset can shift the boundary by at most 26 hours,
-- which is worth at most one extra award — not the unbounded forgery the
-- client-side write allowed. NULL falls back to +08:00 (SGT), the audience.
CREATE OR REPLACE FUNCTION public.local_day_bounds(
  p_tz_offset_minutes integer,
  OUT day_start timestamptz,
  OUT day_date date
)
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_offset integer;
  v_local_now timestamp;
BEGIN
  v_offset := LEAST(GREATEST(COALESCE(p_tz_offset_minutes, 480), -720), 840);
  -- Naive "wall clock" time in the learner's zone.
  v_local_now := (now() AT TIME ZONE 'UTC') + make_interval(mins => v_offset);
  day_date := v_local_now::date;
  day_start := (date_trunc('day', v_local_now) - make_interval(mins => v_offset)) AT TIME ZONE 'UTC';
END;
$$;

-- ---------------------------------------------------------------------------
-- Level ladder
-- ---------------------------------------------------------------------------
-- Mirrors the client's progressive ladder exactly: each level costs
-- (level * 200) XP, so the cumulative thresholds are 200, 600, 1200, 2000, ...
CREATE OR REPLACE FUNCTION public.gamification_level_for_xp(p_total_xp integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  v_level integer := 1;
  v_needed integer := 0;
BEGIN
  IF p_total_xp IS NULL OR p_total_xp <= 0 THEN
    RETURN 1;
  END IF;
  WHILE v_needed <= p_total_xp LOOP
    v_needed := v_needed + v_level * 200;
    EXIT WHEN v_needed > p_total_xp;
    v_level := v_level + 1;
  END LOOP;
  RETURN v_level;
END;
$$;

-- ---------------------------------------------------------------------------
-- Shared profile credit
-- ---------------------------------------------------------------------------
-- Applies an XP delta to the caller's profile and recomputes level + streak.
-- Private: not granted to authenticated, so it can only be reached through the
-- award_* functions below, which decide the amount from server-side facts.
CREATE OR REPLACE FUNCTION public.apply_gamification_xp(
  p_user_id uuid,
  p_xp integer,
  p_today date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_prev record;
  v_new_total integer;
  v_new_level integer;
  v_streak integer;
BEGIN
  SELECT COALESCE(total_xp, 0) AS total_xp,
         COALESCE(current_level, 1) AS current_level,
         COALESCE(streak_days, 0) AS streak_days,
         last_active_date
    INTO v_prev
    FROM public.profiles
   WHERE user_id = p_user_id::text
     FOR UPDATE;

  IF NOT FOUND THEN
    -- A learner with no profile row would previously have silently lost their
    -- XP (the client bailed on `if (!profile) return;`). Create it instead.
    INSERT INTO public.profiles (user_id, total_xp, current_level, streak_days, last_active_date)
    VALUES (p_user_id::text, 0, 1, 0, p_today)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT COALESCE(total_xp, 0) AS total_xp,
           COALESCE(current_level, 1) AS current_level,
           COALESCE(streak_days, 0) AS streak_days,
           last_active_date
      INTO v_prev
      FROM public.profiles
     WHERE user_id = p_user_id::text
       FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'No profile for user %', p_user_id USING ERRCODE = 'P0002';
    END IF;
  END IF;

  v_new_total := GREATEST(v_prev.total_xp + GREATEST(COALESCE(p_xp, 0), 0), 0);
  v_new_level := public.gamification_level_for_xp(v_new_total);

  -- Streak against the learner's own calendar day, matching the client.
  IF v_prev.last_active_date = p_today - 1 THEN
    v_streak := v_prev.streak_days + 1;
  ELSIF v_prev.last_active_date IS DISTINCT FROM p_today THEN
    v_streak := 1;
  ELSE
    v_streak := v_prev.streak_days;
  END IF;

  UPDATE public.profiles
     SET total_xp = v_new_total,
         current_level = v_new_level,
         streak_days = v_streak,
         last_active_date = p_today,
         updated_at = now()
   WHERE user_id = p_user_id::text;

  RETURN jsonb_build_object(
    'total_xp', v_new_total,
    'current_level', v_new_level,
    'previous_level', v_prev.current_level,
    'leveled_up', v_new_level > v_prev.current_level,
    'streak_days', v_streak
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_gamification_xp(uuid, integer, date) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Quiz XP
-- ---------------------------------------------------------------------------
-- Recomputes the reward server-side. The formula mirrors the client's old
-- `calculateXP`:
--
--   base 20 XP, plus a bonus of floor((score / totalQuestions) * 50)
--   => 20 XP for a zero score, 70 XP for a perfect score.
--
-- The score is clamped into [0, total_questions] before it is used, so a
-- forged `score: 99999` cannot inflate the bonus past 50.
CREATE OR REPLACE FUNCTION public.award_quiz_xp(
  p_product_id text,
  p_video_id text DEFAULT NULL,
  p_score integer DEFAULT 0,
  p_total_questions integer DEFAULT 0,
  p_category_id text DEFAULT NULL,
  p_tz_offset_minutes integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_bounds record;
  v_score integer;
  v_total integer;
  v_xp integer;
  v_profile record;
  v_result jsonb;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_product_id IS NULL OR btrim(p_product_id) = '' THEN
    RAISE EXCEPTION 'product_id is required' USING ERRCODE = '22023';
  END IF;

  v_total := COALESCE(p_total_questions, 0);
  IF v_total <= 0 OR v_total > 500 THEN
    RAISE EXCEPTION 'total_questions must be between 1 and 500' USING ERRCODE = '22023';
  END IF;
  v_score := LEAST(GREATEST(COALESCE(p_score, 0), 0), v_total);

  SELECT * INTO v_bounds FROM public.local_day_bounds(p_tz_offset_minutes);

  -- Idempotency against double submits: two concurrent calls for the same
  -- (user, product, lesson) serialise here, so the second one sees the first
  -- one's row and reports a duplicate instead of awarding twice.
  PERFORM pg_advisory_xact_lock(
    hashtextextended('award_quiz_xp|' || v_user::text || '|' || p_product_id || '|' || COALESCE(p_video_id, ''), 0)
  );

  IF EXISTS (
    SELECT 1
      FROM public.quiz_attempts qa
     WHERE qa.user_id = v_user
       AND qa.product_id = p_product_id
       AND qa.completed_at >= v_bounds.day_start
       AND qa.video_id IS NOT DISTINCT FROM p_video_id
  ) THEN
    SELECT COALESCE(total_xp, 0) AS total_xp,
           COALESCE(current_level, 1) AS current_level,
           COALESCE(streak_days, 0) AS streak_days
      INTO v_profile
      FROM public.profiles
     WHERE user_id = v_user::text;

    RETURN jsonb_build_object(
      'duplicate', true,
      'awarded_xp', 0,
      'total_xp', COALESCE(v_profile.total_xp, 0),
      'current_level', COALESCE(v_profile.current_level, 1),
      'previous_level', COALESCE(v_profile.current_level, 1),
      'leveled_up', false,
      'streak_days', COALESCE(v_profile.streak_days, 0)
    );
  END IF;

  v_xp := 20 + floor((v_score::numeric / v_total) * 50)::integer;

  INSERT INTO public.quiz_attempts (user_id, product_id, video_id, score, total_questions, xp_earned)
  VALUES (v_user, p_product_id, p_video_id, v_score, v_total, v_xp);

  -- learning_progress.category_id is nullable now, but a quiz on a surface with
  -- no real category (CMFAS modules) still shouldn't fabricate one.
  IF p_category_id IS NOT NULL AND btrim(p_category_id) <> '' THEN
    INSERT INTO public.learning_progress (user_id, category_id, product_id, progress_type, xp_earned)
    VALUES (v_user, p_category_id, p_product_id, 'quiz_completed', v_xp);
  END IF;

  v_result := public.apply_gamification_xp(v_user, v_xp, v_bounds.day_date);

  RETURN v_result || jsonb_build_object('duplicate', false, 'awarded_xp', v_xp);
END;
$$;

-- ---------------------------------------------------------------------------
-- Page-visit XP
-- ---------------------------------------------------------------------------
-- The old client throttle was a localStorage key, so clearing site data farmed
-- 5 XP per refresh. The limit is now a real once-per-local-day check against
-- the learner's own learning_progress rows.
CREATE OR REPLACE FUNCTION public.award_page_visit_xp(
  p_category_id text,
  p_product_id text DEFAULT NULL,
  p_tz_offset_minutes integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_bounds record;
  v_xp constant integer := 5;
  v_profile record;
  v_result jsonb;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_category_id IS NULL OR btrim(p_category_id) = '' THEN
    RAISE EXCEPTION 'category_id is required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_bounds FROM public.local_day_bounds(p_tz_offset_minutes);

  PERFORM pg_advisory_xact_lock(
    hashtextextended('award_page_visit_xp|' || v_user::text || '|' || p_category_id || '|' || COALESCE(p_product_id, ''), 0)
  );

  IF EXISTS (
    SELECT 1
      FROM public.learning_progress lp
     WHERE lp.user_id = v_user
       AND lp.progress_type = 'page_visited'
       AND lp.category_id IS NOT DISTINCT FROM p_category_id
       AND lp.product_id IS NOT DISTINCT FROM p_product_id
       AND lp.completed_at >= v_bounds.day_start
  ) THEN
    SELECT COALESCE(total_xp, 0) AS total_xp,
           COALESCE(current_level, 1) AS current_level,
           COALESCE(streak_days, 0) AS streak_days
      INTO v_profile
      FROM public.profiles
     WHERE user_id = v_user::text;

    RETURN jsonb_build_object(
      'duplicate', true,
      'awarded_xp', 0,
      'total_xp', COALESCE(v_profile.total_xp, 0),
      'current_level', COALESCE(v_profile.current_level, 1),
      'previous_level', COALESCE(v_profile.current_level, 1),
      'leveled_up', false,
      'streak_days', COALESCE(v_profile.streak_days, 0)
    );
  END IF;

  INSERT INTO public.learning_progress (user_id, category_id, product_id, progress_type, xp_earned)
  VALUES (v_user, p_category_id, p_product_id, 'page_visited', v_xp);

  v_result := public.apply_gamification_xp(v_user, v_xp, v_bounds.day_date);

  RETURN v_result || jsonb_build_object('duplicate', false, 'awarded_xp', v_xp);
END;
$$;

-- ---------------------------------------------------------------------------
-- Achievements
-- ---------------------------------------------------------------------------
-- Badge XP also landed on profiles.total_xp from the client, and the client
-- decided which badges had been earned. Both are now evaluated here from the
-- learner's own rows. The requirement types match the old client switch:
-- quiz_completion / perfect_score / total_quizzes / streak are checked;
-- anything else (daily_quizzes, category_completion) is not yet implemented and
-- returns false, exactly as the client's `default:` branch did.
CREATE OR REPLACE FUNCTION public.claim_achievements(
  p_tz_offset_minutes integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_bounds record;
  v_total_quizzes integer;
  v_has_perfect boolean;
  v_streak integer;
  v_awarded jsonb := '[]'::jsonb;
  v_xp integer := 0;
  v_inserted uuid;
  a record;
  v_earned boolean;
  v_result jsonb;
  v_profile record;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_bounds FROM public.local_day_bounds(p_tz_offset_minutes);

  PERFORM pg_advisory_xact_lock(hashtextextended('claim_achievements|' || v_user::text, 0));

  SELECT count(*) INTO v_total_quizzes FROM public.quiz_attempts WHERE user_id = v_user;
  SELECT EXISTS (
    SELECT 1 FROM public.quiz_attempts
     WHERE user_id = v_user AND total_questions > 0 AND score >= total_questions
  ) INTO v_has_perfect;
  SELECT COALESCE(streak_days, 0) INTO v_streak FROM public.profiles WHERE user_id = v_user::text;

  FOR a IN
    SELECT ac.id, ac.name, ac.description, ac.icon, ac.xp_reward, ac.requirement_type, ac.requirement_value
      FROM public.achievements ac
     WHERE NOT EXISTS (
       SELECT 1 FROM public.user_achievements ua
        WHERE ua.user_id = v_user AND ua.achievement_id = ac.id
     )
     ORDER BY ac.xp_reward NULLS LAST, ac.id
  LOOP
    v_earned := CASE a.requirement_type
      WHEN 'quiz_completion' THEN v_total_quizzes >= GREATEST(COALESCE(a.requirement_value, 1), 1)
      WHEN 'perfect_score'   THEN v_has_perfect
      WHEN 'total_quizzes'   THEN v_total_quizzes >= COALESCE(a.requirement_value, 0)
      WHEN 'streak'          THEN COALESCE(v_streak, 0) >= COALESCE(a.requirement_value, 0)
      ELSE false
    END;

    IF v_earned THEN
      v_inserted := NULL;
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (v_user, a.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING
      RETURNING id INTO v_inserted;

      -- No XP for a badge that was already there (concurrent claim).
      IF v_inserted IS NOT NULL THEN
        v_xp := v_xp + COALESCE(a.xp_reward, 0);
        v_awarded := v_awarded || jsonb_build_object(
          'id', a.id,
          'name', a.name,
          'description', a.description,
          'icon', a.icon,
          'xp_reward', COALESCE(a.xp_reward, 0)
        );
      END IF;
    END IF;
  END LOOP;

  IF v_xp > 0 THEN
    v_result := public.apply_gamification_xp(v_user, v_xp, v_bounds.day_date);
  ELSE
    SELECT COALESCE(total_xp, 0) AS total_xp,
           COALESCE(current_level, 1) AS current_level,
           COALESCE(streak_days, 0) AS streak_days
      INTO v_profile
      FROM public.profiles
     WHERE user_id = v_user::text;

    v_result := jsonb_build_object(
      'total_xp', COALESCE(v_profile.total_xp, 0),
      'current_level', COALESCE(v_profile.current_level, 1),
      'previous_level', COALESCE(v_profile.current_level, 1),
      'leveled_up', false,
      'streak_days', COALESCE(v_profile.streak_days, 0)
    );
  END IF;

  RETURN v_result || jsonb_build_object('awarded', v_awarded, 'awarded_xp', v_xp);
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_quiz_xp(text, text, integer, integer, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_page_visit_xp(text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_achievements(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.local_day_bounds(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gamification_level_for_xp(integer) TO authenticated;

-- ---------------------------------------------------------------------------
-- Take the forgeable write away
-- ---------------------------------------------------------------------------
-- A table-level UPDATE grant covers every column, so a column-level REVOKE on
-- its own does nothing. Drop the table grant, then hand back UPDATE on exactly
-- the columns a learner owns. Everything gamification touches (total_xp,
-- current_level, streak_days, last_active_date) is now writable only through
-- the SECURITY DEFINER functions above.
REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM anon;

GRANT UPDATE (
  display_name,
  email,
  avatar_url,
  first_name,
  last_name,
  address_line_1,
  address_line_2,
  postcode,
  city,
  first_login,
  password_changed_at,
  show_in_leaderboard,
  updated_at
) ON public.profiles TO authenticated;

-- anon has no legitimate profile write: both UPDATE policies on `profiles`
-- require auth.uid(), which is NULL for anon, so this removes a grant that was
-- never usable rather than a working path.
