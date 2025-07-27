import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, Award, Zap, Crown, Settings, User } from "lucide-react";

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

    // Load last login email
    const lastEmail = localStorage.getItem('lastLoginEmail');
    if (lastEmail && !email) {
      setEmail(lastEmail);
    }
  }, []);

  const quickLogins = [
    {
      type: "Master Admin",
      email: "admin@demo.com",
      password: "demo123456",
      description: "Full system access & user management",
      icon: Crown,
      color: "text-yellow-500"
    },
    {
      type: "Admin",
      email: "admin@demo.com", 
      password: "demo123456",
      description: "Admin dashboard & content management",
      icon: Settings,
      color: "text-blue-500"
    },
    {
      type: "Regular User",
      email: "user@demo.com",
      password: "demo123456", 
      description: "Standard user experience",
      icon: User,
      color: "text-green-500"
    }
  ];

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
      // Create approval request instead of user account
      const nameParts = displayName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const { error } = await supabase
        .from('user_approval_requests')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName || null,
          reason: "User registration request"
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Request Already Submitted",
            description: "A registration request with this email already exists. Please wait for admin approval.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Registration Request Submitted!",
        description: "Your request has been sent to administrators for approval. You'll receive an email once your account is approved.",
      });
      
      // Clear form
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
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

      // Handle sign in errors
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
              title: "Demo Account Setup Required",
              description: "Demo account created but requires email confirmation. To use demo mode immediately, please disable email confirmations in your Supabase Auth settings.",
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
              title: "Demo Account Ready!",
              description: "You can now use all admin features",
            });
            window.location.href = '/';
          }
        } else if (signInError.message.includes('Email not confirmed') || signInError.message.includes('email_not_confirmed')) {
          toast({
            title: "Demo Account Needs Setup",
            description: "Your demo account exists but requires email confirmation. To enable instant demo access, please disable 'Confirm email' in your Supabase Auth settings.",
            variant: "default",
          });
        } else {
          throw signInError;
        }
      }
    } catch (error: any) {
      console.error('Demo login error:', error);
      toast({
        title: "Demo Login Failed",
        description: error.message || "An error occurred during demo login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (loginEmail: string, loginPassword: string) => {
    setEmail(loginEmail);
    setPassword(loginPassword);
    setLoading(true);

    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Sign out error (continuing):', err);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      if (data.user) {
        localStorage.setItem('lastLoginEmail', loginEmail);
        toast({
          title: "Quick Login Successful!",
          description: `Signed in as ${quickLogins.find(q => q.email === loginEmail)?.type}`,
        });
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Quick login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Helmet>
        <title>Sign In - AIA Product Compass Hub</title>
        <meta name="description" content="Sign in to access the AIA Product Compass Hub - Track your learning progress, earn achievements, and access comprehensive product training materials." />
      </Helmet>
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary p-4 rounded-full">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Knowledge Portal
          </h1>
          <p className="text-muted-foreground">
            Choose your access level or sign in with your account
          </p>
        </div>

        {/* Quick Login Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground text-center">
            Quick Access
          </h3>
          {quickLogins.map((login) => {
            const IconComponent = login.icon;
            return (
              <Card key={login.type} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent>
                  <Button
                    onClick={() => handleQuickLogin(login.email, login.password)}
                    variant="ghost"
                    className="w-full h-auto p-0 justify-start hover:bg-transparent"
                    disabled={loading}
                  >
                    <div className="flex items-center gap-3 text-left w-full">
                      <div className={`p-2 rounded-lg bg-muted/50 ${login.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{login.type}</div>
                        <div className="text-sm text-muted-foreground">{login.description}</div>
                      </div>
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or use your account
            </span>
          </div>
        </div>

        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Sign In
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
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && e.currentTarget.form?.requestSubmit()}
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
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && e.currentTarget.form?.requestSubmit()}
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
                     Request Account
                   </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          💡 Use quick access buttons above for instant demo access with different permission levels
        </p>
      </div>
    </div>
  );
};

export default Auth;