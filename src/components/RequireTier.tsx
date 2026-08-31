import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { TierLockedScreen } from '@/components/tier/TierLockedScreen';
import { FEATURE_LABELS, type FeatureKey } from '@/lib/tiers';

interface RequireTierProps {
  feature: FeatureKey;
  children: React.ReactNode;
  /** Where the locked screen's "way out" link points. Defaults to `/`. */
  redirectTo?: string;
}

/**
 * Route guard that blocks access if the user's tier doesn't unlock the given
 * feature. Admins (`admin`, `master_admin`) always pass through — see
 * `useFeatureAccess.isAdminBypass`. Intended to wrap route elements INSIDE
 * `<RequireAuth>`.
 *
 * On block: renders `TierLockedScreen` IN PLACE. It used to toast and redirect
 * to `/`, which meant anyone opening a link to a gated page (a playbook a
 * colleague shared, a bookmark) silently lost the page and was told only that
 * "this section" was locked. The screen names the section, names the tier that
 * unlocks it, offers the existing upgrade-request flow, and links home — so
 * nothing is lost and nobody is stranded.
 *
 * If the tier lookup itself FAILED we can't tell allowed from blocked, so we
 * render an explicit error + Retry instead of redirecting (which would look
 * like a downgrade to Explorer). Access is never granted on that path.
 *
 * Waits for loading to settle before making a decision, like `RequireAuth`.
 */
export function RequireTier({ feature, children, redirectTo = '/' }: RequireTierProps) {
  const { can, lowestTierFor, tier, isAdminBypass, permissionsLoading, accessError, retryAccess } =
    useFeatureAccess();

  const allowed = isAdminBypass || can(feature);

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
    // Rendered in place, so there is no redirect target to ping-pong against
    // even when `/` itself is gated — `redirectTo` is now just where the
    // "way out" link points.
    return (
      <TierLockedScreen
        sectionLabel={FEATURE_LABELS[feature] ?? 'This section'}
        currentTier={tier}
        requiredTier={lowestTierFor(feature)}
        homeHref={redirectTo}
      />
    );
  }

  return <>{children}</>;
}
