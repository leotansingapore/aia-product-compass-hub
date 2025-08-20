import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Clock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const AwaitingApproval = () => {
  const { user, signOut, hasRole, loading } = useAuth();

  console.log('[AwaitingApproval] State:', { user: !!user, hasRole, loading, userEmail: user?.email });

  useEffect(() => {
    // If no user, redirect to auth
    if (!loading && !user) {
      console.log('[AwaitingApproval] No user, redirecting to auth');
      window.location.href = '/auth';
      return;
    }
    
    // If user has role, redirect to dashboard  
    if (!loading && user && hasRole) {
      console.log('[AwaitingApproval] User has role, redirecting to dashboard');
      window.location.href = '/';
      return;
    }
  }, [user, hasRole, loading]);

  if (loading) {
    console.log('[AwaitingApproval] Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[AwaitingApproval] No user found, should redirect...');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4 py-8">
      <Helmet>
        <title>Account Awaiting Approval - FINternship Learning Platform</title>
        <meta name="description" content="Your account has been created and is awaiting admin approval. You'll receive an email once your access has been granted." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-lg">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-amber-100 dark:bg-amber-900/20 p-4 rounded-full">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                Account Awaiting Approval
              </h1>
              <p className="text-muted-foreground">
                Your account has been successfully created! An administrator will review your request and grant access soon.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>
                  You'll receive an email at <strong>{user.email}</strong> once your account is approved
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                <Shield className="h-4 w-4 flex-shrink-0" />
                <span>
                  This approval process ensures platform security and proper access management
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Need immediate access? Contact your administrator or try our demo accounts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/auth'}
                  className="flex-1"
                >
                  Try Demo Accounts
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={signOut}
                  className="flex-1"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AwaitingApproval;