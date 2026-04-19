import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
 * Mirrors the shape of `RequireAuth`: uses `<Navigate replace state={{from}}>`
 * and waits for loading to settle before making a decision.
 */
export function RequireTier({ feature, children, redirectTo = '/' }: RequireTierProps) {
  const location = useLocation();
  const { can, isAdminBypass, permissionsLoading } = useFeatureAccess();
  const toastShownRef = useRef(false);

  const allowed = isAdminBypass || can(feature);

  useEffect(() => {
    if (permissionsLoading) return;
    if (!allowed && !toastShownRef.current) {
      toastShownRef.current = true;
      toast({
        title: 'Not available on your tier',
        description: 'Request an upgrade to unlock this section.',
        variant: 'destructive',
      });
    }
  }, [allowed, permissionsLoading]);

  if (permissionsLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center py-12" aria-busy="true" aria-label="Loading access">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
