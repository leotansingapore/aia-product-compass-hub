import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { toast } from '@/hooks/use-toast';
import type { FeatureKey } from '@/lib/tiers';

interface RequireTierProps {
  feature: FeatureKey;
  children: React.ReactNode;
  /** Override redirect destination. Defaults to `/`. */
  redirectTo?: string;
}

/**
 * Route guard that blocks access if the user's tier doesn't unlock the given
 * feature. Admins (`admin`, `master_admin`) always pass through — see
 * `useFeatureAccess.isAdminBypass`. Intended to wrap route elements INSIDE
 * `<RequireAuth>`.
 *
 * On block: shows a toast ("Not available on your tier…") and redirects to
 * `/` (or `redirectTo`), so the user always lands on a tier-appropriate home.
 *
 * If the tier lookup itself FAILED we can't tell allowed from blocked, so we
 * render an explicit error + Retry instead of redirecting (which would look
 * like a downgrade to Explorer). Access is never granted on that path.
 *
 * Mirrors the shape of `RequireAuth`: uses `<Navigate replace state={{from}}>`
 * and waits for loading to settle before making a decision.
 */
export function RequireTier({ feature, children, redirectTo = '/' }: RequireTierProps) {
  const location = useLocation();
  const { can, isAdminBypass, permissionsLoading, accessError, retryAccess } = useFeatureAccess();
  const toastShownRef = useRef(false);

  const allowed = isAdminBypass || can(feature);

  useEffect(() => {
    if (permissionsLoading || accessError) return;
    if (!allowed && !toastShownRef.current) {
      toastShownRef.current = true;
      // Informational, not destructive: this fires on ordinary app opens too
      // (e.g. restoring a last-visited route after an access change), where a
      // red error toast reads as something having gone wrong.
      toast({
        title: 'This section is locked',
        description: 'Not included in your current access — ask your admin to unlock it.',
      });
    }
  }, [allowed, permissionsLoading, accessError]);

  if (permissionsLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center py-12" aria-busy="true" aria-label="Loading access">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Tier unknown because the lookup failed: don't redirect (that reads as
  // "you've been downgraded") and don't let the content through either.
  if (accessError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="font-medium">Couldn't check your access</p>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn't load your access level, so this section stays closed for now.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => retryAccess()} className="gap-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  if (!allowed) {
    // Safety net: if the redirect target equals the current path (e.g. the
    // fallback `/` itself ever gets gated by a tier this user lacks), we'd
    // ping-pong here forever. Bail out to /auth to escape the loop instead
    // of stack-overflowing the router.
    const target = redirectTo === location.pathname ? '/auth' : redirectTo;
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
