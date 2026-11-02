-- One feedback row per roleplay session. Two calls at once (the Tavus webhook and the
-- retry button, or a double click) could each insert a row, each pay for the three model
-- calls and each email the learner. generate-roleplay-feedback treats a unique-key
-- conflict (23505) on its insert as "already generating"; until this key exists it falls
-- back to a weaker oldest-row check.
--
-- NOT APPLIED. Needs Leo's ok before it runs on production.
--
-- A session with two rows already breaks its feedback page (the page reads one row per
-- session), so keep one per session first: a completed row over any other, then the newest.
-- Preview what goes before applying:
--   select session_id, count(*), array_agg(generation_status order by created_at)
--   from public.roleplay_feedback group by session_id having count(*) > 1;

DELETE FROM public.roleplay_feedback f
USING (
  SELECT id, row_number() OVER (
    PARTITION BY session_id
    ORDER BY (generation_status = 'completed') DESC, created_at DESC, id DESC
  ) AS rn
  FROM public.roleplay_feedback
) ranked
WHERE f.id = ranked.id AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS roleplay_feedback_session_id_key
  ON public.roleplay_feedback (session_id);
