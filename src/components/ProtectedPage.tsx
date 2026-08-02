import { ReactNode, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedSection } from './ProtectedSection';
import { useNavigate } from 'react-router-dom';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
interface ProtectedPageProps {
  pageId: string;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Purely decorative stand-in for the gated page, used behind the lock/sign-in
 * overlays. The real `children` must NEVER be mounted on a denial path: it
 * would put the restricted content in the DOM (readable via DevTools, Ctrl+A,
 * reader mode, and screen readers regardless of `blur`/`opacity`) and would
 * run the children's effects — e.g. `useProductDetail` fires `recordPageVisit`,
 * an XP write, for a user who was just denied access.
 */
function BlurredPlaceholder() {
  return (
    <div
      className="absolute inset-0 overflow-hidden blur-sm opacity-30 pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 p-8">
        <div className="h-10 w-2/3 rounded-lg bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-48 w-full rounded-xl bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-28 rounded-xl bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
        </div>
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProtectedPage({ pageId, children, fallback, redirectTo }: ProtectedPageProps) {
  const { getPagePermission, canAccessPage, loading } = usePermissions();
  const { user } = useSimplifiedAuth();
  const navigate = useNavigate();

  // Debug logging for roleplay page specifically
  if (pageId === 'roleplay') {
    console.log('🔍 ProtectedPage Debug for roleplay:', {
      pageId,
      loading,
      user: !!user,
      canAccess: canAccessPage(pageId),
      permission: getPagePermission(pageId)
    });
  }

  const deniedHidden = !canAccessPage(pageId);

  // Compute permission status upfront so hooks order stays consistent
  const permission = getPagePermission(pageId);
  const deniedLocked = permission.permission_type === 'locked';

  // Redirect effect combines both hidden and locked states
  useEffect(() => {
    // Don't redirect while still loading permissions
    if (loading) return;
    
    if (pageId === 'roleplay') {
      console.log('🔍 ProtectedPage redirect check for roleplay:', {
        redirectTo,
        deniedHidden,
        deniedLocked,
        shouldRedirect: redirectTo && (deniedHidden || deniedLocked)
      });
    }
    
    if (redirectTo && (deniedHidden || deniedLocked)) {
      console.log('🔍 Redirecting from', pageId, 'to:', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [redirectTo, deniedHidden, deniedLocked, navigate, loading, pageId]);

  // If page access is restricted
  if (deniedHidden) {
    if (redirectTo) {
      return null;
    }
    
    // Show sign-in prompt for unauthenticated users
    if (!user) {
      return (
        <div className="relative min-h-screen">
          <BlurredPlaceholder />

          {/* Sign-in overlay */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <div className="text-2xl">🔐</div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Sign In Required</h3>
                <p className="text-muted-foreground">
                  Please sign in to access this content.
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Show access restricted message for authenticated users without permissions
    return (
      <div className="relative min-h-screen">
        <BlurredPlaceholder />

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <div className="text-2xl">🔒</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Access Restricted</h3>
              <p className="text-muted-foreground">
                This page requires special permissions. Please ask your administrator for access to this section.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If page is locked
  if (deniedLocked) {
    if (redirectTo) {
      return null;
    }
    return (
      <div className="relative min-h-screen">
        <BlurredPlaceholder />

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <div className="text-2xl">🔒</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Page Locked</h3>
              <p className="text-muted-foreground">
                {permission.lock_message || 'This page is currently locked. Please ask your administrator for access.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}