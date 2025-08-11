import { ReactNode, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedSection } from './ProtectedSection';
import { useNavigate } from 'react-router-dom';
interface ProtectedPageProps {
  pageId: string;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedPage({ pageId, children, fallback, redirectTo }: ProtectedPageProps) {
  const { getPagePermission, canAccessPage } = usePermissions();
  const navigate = useNavigate();

  const deniedHidden = !canAccessPage(pageId);

  // Compute permission status upfront so hooks order stays consistent
  const permission = getPagePermission(pageId);
  const deniedLocked = permission.permission_type === 'locked';

  // Redirect effect combines both hidden and locked states
  useEffect(() => {
    if (redirectTo && (deniedHidden || deniedLocked)) {
      navigate(redirectTo, { replace: true });
    }
  }, [redirectTo, deniedHidden, deniedLocked, navigate]);

  // If page access is restricted
  if (deniedHidden) {
    if (redirectTo) {
      return null;
    }
    return (
      <div className="relative min-h-screen">
        {/* Blurred background content */}
        <div className="absolute inset-0 blur-sm opacity-30 pointer-events-none">
          {children}
        </div>
        
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
        {/* Blurred background content */}
        <div className="absolute inset-0 blur-sm opacity-30 pointer-events-none">
          {children}
        </div>
        
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