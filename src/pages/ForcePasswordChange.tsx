import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { SecurityForm } from "@/components/account/SecurityForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function ForcePasswordChange() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until auth is initialized
    if (loading) return;

    const hash = window.location.hash || '';
    const hasRecoveryToken = hash.includes('type=recovery') || hash.includes('access_token');

    // If no user and no recovery token, send to auth
    if (!user && !hasRecoveryToken) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // While waiting for auth to initialize or for recovery token to log user in, avoid flashing redirect
  const hash = window.location.hash || '';
  const hasRecoveryToken = hash.includes('type=recovery') || hash.includes('access_token');
  if (loading || (!user && hasRecoveryToken)) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Helmet>
        <title>Reset Password - FINternship</title>
        <meta name="description" content="Optional password reset to secure your account—change it now or later." />
        <link rel="canonical" href={`${window.location.origin}/force-password`} />
      </Helmet>

      <div className="max-w-xl w-full space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Secure Your Account</h1>
          <p className="text-muted-foreground">
            You're using a generated password. It's recommended to set a new password now, or you can skip and do it later.
          </p>
        </div>

        <Card className="p-4 sm:p-6">
          <SecurityForm
            requireCurrent={false}
            onSuccess={async () => {
              // Proactively mark first_login as false to avoid redirect race
              try {
                await supabase
                  .from('profiles')
                  .update({ first_login: false, password_changed_at: new Date().toISOString() })
                  .eq('user_id', user.id);
              } catch {}
              navigate('/');
            }}
            onCancel={() => {
              // Optional flow: cancel returns home
              navigate('/');
            }}
          />
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              Skip for now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
