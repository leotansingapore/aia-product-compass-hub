import { useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { usePermissions } from "@/hooks/usePermissions";
import Dashboard from "./Dashboard";

const Index = memo(() => {
  const { user, loading } = useSimplifiedAuth();
  const navigate = useNavigate();

  const hasRecoveryHash =
    typeof window !== 'undefined' &&
    (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token='));

  useEffect(() => {
    if (hasRecoveryHash) {
      navigate('/reset-password', { replace: true });
      return;
    }
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate, hasRecoveryHash]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return null;
  }

  return <Dashboard />;
});

export default Index;