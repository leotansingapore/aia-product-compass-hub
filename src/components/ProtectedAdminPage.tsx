import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Navigate, useLocation } from 'react-router-dom';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedAdminPageProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Route guard for admin-only pages. Mirrors `RequireTier`: waits for the
 * permission check to settle, then redirects declaratively with `<Navigate>`
 * instead of painting an "Access Denied" card and navigating from an effect
 * (which flashed the denial screen for a frame before the redirect landed).
 */
export function ProtectedAdminPage({ children, redirectTo = '/' }: ProtectedAdminPageProps) {
  const { isMasterAdmin, hasRole, loading } = usePermissions();
  const { user } = useSimplifiedAuth();
  const location = useLocation();

  const isAdmin = isMasterAdmin() || hasRole('admin');

  // Show loading state while checking permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Checking Permissions...</CardTitle>
            <CardDescription>
              Please wait while we verify your access level.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Session expired / signed out while on an admin page.
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    const target = redirectTo === location.pathname ? '/auth' : redirectTo;
    return <Navigate to={target} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}