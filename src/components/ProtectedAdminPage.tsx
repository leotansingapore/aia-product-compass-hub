import { ReactNode, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedAdminPageProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedAdminPage({ children, redirectTo = '/' }: ProtectedAdminPageProps) {
  const { isMasterAdmin, hasRole, loading } = usePermissions();
  const { user } = useSimplifiedAuth();
  const navigate = useNavigate();

  const isAdmin = isMasterAdmin() || hasRole('admin');

  useEffect(() => {
    // Don't redirect while still loading permissions or user data
    if (loading || !user) return;
    
    // Redirect non-admin users
    if (!isAdmin) {
      console.log('🔒 Non-admin user attempting to access admin dashboard, redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [isAdmin, loading, user, navigate, redirectTo]);

  // Show loading state while checking permissions
  if (loading || !user) {
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

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be an admin to access this page. You will be redirected shortly.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}