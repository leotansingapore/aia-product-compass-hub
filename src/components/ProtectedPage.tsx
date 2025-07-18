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
  
  // If page is hidden, don't render anything
  if (!canAccessPage(pageId)) {
    return fallback || null;
  }

  const permission = getPagePermission(pageId);
  
  // If page is locked, show locked state
  if (permission.permission_type === 'locked') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-12 w-12 text-muted-foreground mb-4">🔒</div>
        <h3 className="text-lg font-semibold mb-2">Page Locked</h3>
        <p className="text-muted-foreground">
          {permission.lock_message || 'This page is currently locked and requires special access.'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}