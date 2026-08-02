-- Documentation migration: the roleplay tables were created through the
-- Lovable dashboard, so their RLS policies existed ONLY in the live database
-- and could not be reviewed in version control or reproduced in a fresh
-- environment. Cycle E2 verified the live policies are correct (owner-scoped)
-- and captures them here verbatim so they are reviewable and redeployable.
--
-- Verified live 2026-08-02: RLS enabled on all four tables, no permissive
-- policy allowing cross-user reads or session hijacking.
--
-- IDEMPOTENT: safe to re-run; drops each policy before recreating it.

ALTER TABLE public.roleplay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleplay_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speech_metrics ENABLE ROW LEVEL SECURITY;

-- roleplay_sessions: owner-only read/insert/update. No DELETE policy by design.
DROP POLICY IF EXISTS "Users can view their own roleplay sessions" ON public.roleplay_sessions;
CREATE POLICY "Users can view their own roleplay sessions"
  ON public.roleplay_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own roleplay sessions" ON public.roleplay_sessions;
CREATE POLICY "Users can create their own roleplay sessions"
  ON public.roleplay_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NOTE: TavusVideoChat updates a session by id alone (no user_id filter); this
-- policy is what actually prevents one learner from writing to another's row.
DROP POLICY IF EXISTS "Users can update their own roleplay sessions" ON public.roleplay_sessions;
CREATE POLICY "Users can update their own roleplay sessions"
  ON public.roleplay_sessions FOR UPDATE USING (auth.uid() = user_id);

-- roleplay_feedback: readable by the session owner; written only by the
-- service role (the feedback edge function).
DROP POLICY IF EXISTS "Users can view feedback for their sessions" ON public.roleplay_feedback;
CREATE POLICY "Users can view feedback for their sessions"
  ON public.roleplay_feedback FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.roleplay_sessions rs
            WHERE rs.id = roleplay_feedback.session_id AND rs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role can manage feedback" ON public.roleplay_feedback;
CREATE POLICY "Service role can manage feedback"
  ON public.roleplay_feedback FOR ALL
  USING (current_setting('role') = 'service_role')
  WITH CHECK (current_setting('role') = 'service_role');

-- conversation_transcripts + speech_metrics: scoped through the parent session.
DROP POLICY IF EXISTS "Users can view their own transcripts" ON public.conversation_transcripts;
CREATE POLICY "Users can view their own transcripts"
  ON public.conversation_transcripts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.roleplay_sessions rs
            WHERE rs.id = conversation_transcripts.session_id AND rs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert their own transcripts" ON public.conversation_transcripts;
CREATE POLICY "Users can insert their own transcripts"
  ON public.conversation_transcripts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.roleplay_sessions rs
            WHERE rs.id = conversation_transcripts.session_id AND rs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can view their own speech metrics" ON public.speech_metrics;
CREATE POLICY "Users can view their own speech metrics"
  ON public.speech_metrics FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.roleplay_sessions rs
            WHERE rs.id = speech_metrics.session_id AND rs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert their own speech metrics" ON public.speech_metrics;
CREATE POLICY "Users can insert their own speech metrics"
  ON public.speech_metrics FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.roleplay_sessions rs
            WHERE rs.id = speech_metrics.session_id AND rs.user_id = auth.uid())
  );
