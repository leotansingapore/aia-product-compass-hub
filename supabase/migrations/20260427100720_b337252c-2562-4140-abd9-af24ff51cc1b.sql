DO $$
DECLARE
  v_auth_id uuid;
BEGIN
  SELECT user_id
    INTO v_auth_id
    FROM public.profiles
    WHERE email = 'avyltest@gmail.com'
    LIMIT 1;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'No profile row found for avyltest@gmail.com';
  END IF;

  INSERT INTO public.first_60_days_progress
    (user_id, day_number, read_at, quiz_passed_at, quiz_score, quiz_attempts, reflection_submitted_at)
  SELECT v_auth_id, d, now(), now(), 100, 1, now()
    FROM generate_series(1, 60) AS d
  ON CONFLICT (user_id, day_number) DO UPDATE
    SET read_at                 = COALESCE(public.first_60_days_progress.read_at,                 EXCLUDED.read_at),
        quiz_passed_at          = COALESCE(public.first_60_days_progress.quiz_passed_at,          EXCLUDED.quiz_passed_at),
        quiz_score              = COALESCE(public.first_60_days_progress.quiz_score,              EXCLUDED.quiz_score),
        quiz_attempts           = GREATEST(public.first_60_days_progress.quiz_attempts,           EXCLUDED.quiz_attempts),
        reflection_submitted_at = COALESCE(public.first_60_days_progress.reflection_submitted_at, EXCLUDED.reflection_submitted_at);

  INSERT INTO public.next_60_days_progress
    (user_id, day_number, read_at, quiz_passed_at, quiz_score, quiz_attempts, reflection_submitted_at)
  SELECT v_auth_id, d, now(), now(), 100, 1, now()
    FROM generate_series(1, 60) AS d
  ON CONFLICT (user_id, day_number) DO UPDATE
    SET read_at                 = COALESCE(public.next_60_days_progress.read_at,                 EXCLUDED.read_at),
        quiz_passed_at          = COALESCE(public.next_60_days_progress.quiz_passed_at,          EXCLUDED.quiz_passed_at),
        quiz_score              = COALESCE(public.next_60_days_progress.quiz_score,              EXCLUDED.quiz_score),
        quiz_attempts           = GREATEST(public.next_60_days_progress.quiz_attempts,           EXCLUDED.quiz_attempts),
        reflection_submitted_at = COALESCE(public.next_60_days_progress.reflection_submitted_at, EXCLUDED.reflection_submitted_at);

  RAISE NOTICE 'Marked 60 + 60 = 120 days complete for avyltest@gmail.com.';
END $$;