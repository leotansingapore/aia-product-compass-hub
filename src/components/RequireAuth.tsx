import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useSimplifiedAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
