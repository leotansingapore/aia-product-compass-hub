-- Rate limiting for the two PUBLIC pre-session auth endpoints
-- (check-academy-user-exists, check-financial-eligibility). Both must stay
-- callable without a session because the login form uses them before the user
-- is authenticated, so throttling is the control rather than authentication.
--
-- Without this they are: (a) an unthrottled user-enumeration oracle, and
-- (b) a free unauthenticated brute-force proxy against the Financial app's
-- password database, using the server's own API key so the upstream sees one
-- trusted caller and cannot throttle the real attacker.
CREATE TABLE IF NOT EXISTS public.auth_endpoint_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  -- Hashed so the table never becomes a plaintext roster of who tried to log in.
  identifier_hash text NOT NULL,
  identifier_kind text NOT NULL CHECK (identifier_kind IN ('email', 'ip')),
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_lookup
  ON public.auth_endpoint_rate_limits (endpoint, identifier_kind, identifier_hash, attempted_at DESC);

ALTER TABLE public.auth_endpoint_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (edge functions) may read or write.

-- Housekeeping: callers prune rows older than the widest window before checking.
CREATE OR REPLACE FUNCTION public.prune_auth_endpoint_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.auth_endpoint_rate_limits WHERE attempted_at < now() - interval '24 hours';
$$;
