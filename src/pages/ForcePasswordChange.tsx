import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { SecurityForm } from "@/components/account/SecurityForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function ForcePasswordChange() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Helmet>
        <title>Reset Password - FINternship</title>
        <meta name="description" content="Force password change for first-time login to secure your account." />
        <link rel="canonical" href={`${window.location.origin}/force-password`} />
      </Helmet>

      <div className="max-w-xl w-full space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Secure Your Account</h1>
          <p className="text-muted-foreground">
            You're using a generated password. Please set a new password to continue.
          </p>
        </div>

        <Card className="p-4 sm:p-6">
          <SecurityForm
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
              // Prevent bypass: cancel signs out
              signOut();
            }}
          />
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign out instead
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
