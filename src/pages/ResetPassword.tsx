import { Helmet } from "react-helmet-async";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const validRef = useRef(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle password reset link errors
  useEffect(() => {
    const hash = window.location.hash || "";
    if (hash && hash.includes("error=")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const description = params.get("error_description") || "Email link is invalid or has expired.";
      setLinkError(decodeURIComponent(description));
    }
  }, []);

  useEffect(() => {
    if (linkError) return; // Don't attempt session flow if link is invalid/expired
    let mounted = true;

    const markValid = () => {
      if (!mounted) return;
      validRef.current = true;
      setValidSession(true);
    };

    // A valid recovery session can arrive either as a live PASSWORD_RECOVERY /
    // SIGNED_IN event or as an already-hydrated session (INITIAL_SESSION, or a
    // session persisted from a full-page hand-off). Accept any of them.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (session && event !== 'SIGNED_OUT') {
          markValid();
        } else if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      },
    );

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (mounted && session) markValid();
      })
      .catch(() => {
        /* handled by the fallback below */
      });

    // Only bounce to sign-in if, after a generous window, NO recovery session
    // ever arrived — e.g. a truly invalid link with no error param. The old 1s
    // timeout turned valid links into dead-ends on slow networks/devices, and
    // the recovery token in the URL is single-use so the user couldn't retry.
    const fallback = setTimeout(() => {
      if (mounted && !validRef.current) navigate('/auth');
    }, 10000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [navigate, linkError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again."
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive", 
        title: "Password Too Short",
        description: "Password must be at least 6 characters long."
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Password Reset Failed",
          description: error.message
        });
      } else {
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated."
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  if (linkError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Helmet>
          <title>Password Reset Link Expired - FINternship</title>
          <meta name="description" content="Your password reset link is invalid or has expired. Request a new one from the sign in page." />
          <link rel="canonical" href={`${window.location.origin}/reset-password`} />
        </Helmet>

        <div className="max-w-lg w-full">
          <Card className="p-4 sm:p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl">Password reset link issue</CardTitle>
              <CardDescription>{linkError}</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-3">
              <p className="text-sm text-muted-foreground">
                This can happen if the link was already used, expired, or was opened in a different browser/device than the one that requested it.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => navigate('/auth')} className="w-full sm:w-auto">Go to Sign In</Button>
                <Button variant="outline" onClick={() => navigate('/auth')} className="w-full sm:w-auto">Request New Reset Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!validSession) {
    return null; // Will redirect in useEffect
  }
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Helmet>
        <title>Reset Password - FINternship</title>
        <meta name="description" content="Create a new password for your account." />
        <link rel="canonical" href={`${window.location.origin}/reset-password`} />
      </Helmet>

      <div className="max-w-xl w-full space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Reset Your Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below to complete the reset process.
          </p>
        </div>

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Password must be at least 6 characters long.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}