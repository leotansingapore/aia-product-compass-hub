-- =============================================
-- 1. Fix RLS on user_access_tiers (user_id is text)
-- =============================================
DROP POLICY IF EXISTS "Users can view own tier" ON public.user_access_tiers;

CREATE POLICY "Users can view own tier"
  ON public.user_access_tiers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- =============================================
-- 2. Create tier_upgrade_requests table
-- =============================================
CREATE TABLE public.tier_upgrade_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_tier    text NOT NULL CHECK (from_tier IN ('explorer', 'papers_taker', 'post_rnf')),
  to_tier      text NOT NULL CHECK (to_tier IN ('explorer', 'papers_taker', 'post_rnf')),
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason       text,
  admin_note   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  reviewed_at  timestamptz,
  reviewer_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Only one pending request per user at a time
CREATE UNIQUE INDEX tier_upgrade_requests_one_pending_per_user
  ON public.tier_upgrade_requests (user_id)
  WHERE status = 'pending';

ALTER TABLE public.tier_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Users can read their own requests
CREATE POLICY "Users read own requests"
  ON public.tier_upgrade_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create requests for themselves
CREATE POLICY "Users create own requests"
  ON public.tier_upgrade_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Admins can read and update all
CREATE POLICY "Admins manage all requests"
  ON public.tier_upgrade_requests FOR ALL
  TO authenticated
  USING  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'master_admin'));