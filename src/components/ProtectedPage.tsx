import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ProtectedSection } from './ProtectedSection';

interface ProtectedPageProps {
  pageId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedPage({ pageId, children, fallback }: ProtectedPageProps) {
  const { getPagePermission, canAccessPage } = usePermissions();
  
  // If page access is restricted, show locked state
  if (!canAccessPage(pageId)) {
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

  const permission = getPagePermission(pageId);
  
  // If page is locked, show locked state
  if (permission.permission_type === 'locked') {
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