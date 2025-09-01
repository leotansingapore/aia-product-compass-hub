import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { usePermissions } from "@/hooks/usePermissions";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user, loading } = useSimplifiedAuth();
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();

  // Debug logging to help identify auth state
  console.log('[Index] Auth state:', { 
    hasUser: !!user, 
    loading, 
    userEmail: user?.email,
    isAdmin 
  });

  useEffect(() => {
    if (!loading) {
      console.log('[Index] Effect - user check:', !!user);
      if (!user) {
        console.log('[Index] No user, redirecting to /auth');
        navigate("/auth");
      } else {
        console.log('[Index] User authenticated, showing dashboard');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return null;
  }

  return <Dashboard />;
};

export default Index;