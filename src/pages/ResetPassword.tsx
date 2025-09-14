import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session (user clicked reset link)
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) {
        setValidSession(true);
      } else {
        // No valid reset session, redirect to auth
        navigate('/auth');
      }
    };

    checkSession();
  }, [navigate]);

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