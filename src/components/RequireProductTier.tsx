import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { toast } from '@/hooks/use-toast';
import { passesProductTierGate } from '@/lib/productTierAccess';

interface RequireProductTierProps {
  /** `products.visible_tiers` for the product being rendered. */
  visibleTiers: string[] | null | undefined;
  children: React.ReactNode;
  /** Override redirect destination. Defaults to `/`. */
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
 * itself failed, otherwise toast + redirect when blocked.
 *
 * This is a client-side gate. See `passesProductTierGate` for the residual
 * server-side (RLS) gap.
 */
export function RequireProductTier({
  visibleTiers,
  children,
  redirectTo = '/',
}: RequireProductTierProps) {
  const location = useLocation();
  const { tier, isAdminBypass, permissionsLoading, accessError, retryAccess } = useFeatureAccess();
  const toastShownRef = useRef(false);

  const allowed = passesProductTierGate(visibleTiers, tier, isAdminBypass);

  useEffect(() => {
    if (permissionsLoading || accessError) return;
    if (!allowed && !toastShownRef.current) {
      toastShownRef.current = true;
      toast({
        title: 'This module is locked',
        description: 'Not included in your current access — ask your admin to unlock it.',
      });
    }
  }, [allowed, permissionsLoading, accessError]);

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
    const target = redirectTo === location.pathname ? '/' : redirectTo;
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
