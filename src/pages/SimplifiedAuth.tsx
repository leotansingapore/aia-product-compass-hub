import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { SimplifiedAuthForm } from "@/components/auth/SimplifiedAuthForm";

const SimplifiedAuth = () => {
  const { user, loading } = useSimplifiedAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard using React Router
    if (user && !loading) {
      console.log('[SimplifiedAuth] Redirecting authenticated user to dashboard');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 py-8">
      <Helmet>
        <title>Sign In - FINternship Learning Platform</title>
        <meta name="description" content="Sign in to access your learning platform with comprehensive financial product training and resources." />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>
      
      <div className="w-full max-w-md">
        <SimplifiedAuthForm />
        
        <div className="text-center text-xs text-muted-foreground mt-6 px-4">
          <p>
            Welcome to the FINternship Knowledge Portal. 
            Create an account or sign in to access comprehensive financial training resources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedAuth;