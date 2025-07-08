import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, Award, Zap } from "lucide-react";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        window.location.href = '/';
      }
    };
    checkUser();
  }, []);

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            display_name: displayName,
            email: email,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        toast({
          title: "Welcome to the Knowledge Portal!",
          description: "Your account has been created successfully",
        });
        
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      // Demo credentials
      const demoEmail = "admin@demo.com";
      const demoPassword = "demo123456";

      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (signInData?.user && signInData?.session) {
        toast({
          title: "Welcome to Demo Mode!",
          description: "You now have admin access to edit content",
        });
        window.location.href = '/';
        return;
      }

      // If sign in failed due to unconfirmed email, try creating account
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          // Account doesn't exist, create it
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                display_name: "Demo Admin",
              }
            }
          });

          if (signUpError) throw signUpError;

          // If account was created but needs confirmation
          if (signUpData.user && !signUpData.session) {
            toast({
              title: "Demo Account Created", 
              description: "Account needs email confirmation. Please ask admin to disable email confirmation in Supabase Auth settings for easier testing.",
              variant: "default",
            });
            return;
          }

          // If we got a session immediately, create profile
          if (signUpData.user && signUpData.session) {
            try {
              await supabase
                .from('profiles')
                .insert({
                  user_id: signUpData.user.id,
                  display_name: "Demo Admin",
                  email: demoEmail,
                });
            } catch (profileError) {
              console.error('Profile creation error:', profileError);
              // Don't fail the whole process for profile creation
            }

            toast({
              title: "Demo Account Created!",
              description: "You can now use the admin features",
            });
            window.location.href = '/';
          }
        } else if (signInError.message.includes('Email not confirmed')) {
          toast({
            title: "Email Confirmation Required",
            description: "Demo account exists but needs email confirmation. Please ask admin to disable email confirmation in Supabase Auth settings.",
            variant: "default",
          });
        } else {
          throw signInError;
        }
      }
    } catch (error: any) {
      toast({
        title: "Demo Login Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary p-4 rounded-full">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Knowledge Portal
          </h1>
          <p className="text-muted-foreground">
            Level up your expertise with our gamified learning platform
          </p>
        </div>

        <Card className="border-accent/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Get Started
            </CardTitle>
            <CardDescription>
              Sign in to track your progress and earn achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    variant="hero"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    variant="hero"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Demo Login Section */}
            <div className="mt-6 pt-6 border-t">
              <div className="text-center space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Demo Access
                </h4>
                <Button 
                  onClick={handleDemoLogin}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-primary/30 hover:bg-primary/5"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  🚀 Try Admin Demo (No Sign-up Required)
                </Button>
                <p className="text-xs text-muted-foreground">
                  Instantly sign in with admin privileges to test content editing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Start your learning journey and unlock achievements as you master each product!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;