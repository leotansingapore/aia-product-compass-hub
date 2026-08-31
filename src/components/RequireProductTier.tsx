import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { TierLockedScreen } from '@/components/tier/TierLockedScreen';
import { passesProductTierGate } from '@/lib/productTierAccess';
import { TIER_LEVELS, type TierLevel } from '@/lib/tiers';

interface RequireProductTierProps {
  /** `products.visible_tiers` for the product being rendered. */
  visibleTiers: string[] | null | undefined;
  children: React.ReactNode;
  /** Where the locked screen's "way out" link points. Defaults to `/`. */
  redirectTo?: string;
}

/**
 * Per-product sibling of `RequireTier`. `RequireTier` gates a whole route by
 * feature key; this gates a single product by its `visible_tiers` allow-list,
 * which the category grid already filters on (`useProductCategory`) but which
 * nothing enforced on `/product/<slug>` — so an excluded tier could reach the
 * full lesson list, rich content and AI chat by typing the URL.
 *
 * Same behaviour contract as `RequireTier`: wait for `permissionsLoading`,
 * render an explicit error + Retry (never granting access) when the tier lookup
 * itself failed, otherwise render `TierLockedScreen` in place when blocked
 * (rather than bouncing the user home with a toast that never said which
 * module they had just tried to open).
 *
 * This is a client-side gate. See `passesProductTierGate` for the residual
 * server-side (RLS) gap.
 */
export function RequireProductTier({
  visibleTiers,
  children,
  redirectTo = '/',
}: RequireProductTierProps) {
  const { tier, isAdminBypass, permissionsLoading, accessError, retryAccess } = useFeatureAccess();

  const allowed = passesProductTierGate(visibleTiers, tier, isAdminBypass);

  // Lowest tier on the product's own allow-list, so the locked screen can name
  // a real target instead of guessing from the feature matrix (this gate is
  // per-product, not per-feature). Matched EXACTLY the way
  // `passesProductTierGate` compares, so the screen can never promise a tier
  // that would still be refused: a legacy or malformed `visible_tiers` value
  // yields null ("an admin has to switch it on") rather than a wrong answer.
  const requiredTier: TierLevel | null =
    Array.isArray(visibleTiers) && visibleTiers.length > 0
      ? (TIER_LEVELS.find((level) => visibleTiers.includes(level)) ?? null)
      : null;

  if (permissionsLoading) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center py-12"
        aria-busy="true"
        aria-label="Loading access"
      >
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
            We couldn't load your access level, so this module stays closed for now.
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
    return (
      <TierLockedScreen
        sectionLabel="This module"
        currentTier={tier}
        requiredTier={requiredTier}
        homeHref={redirectTo}
        homeLabel="Back to what I can open"
      />
    );
  }

  return <>{children}</>;
}
