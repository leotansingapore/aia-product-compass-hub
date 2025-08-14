import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/utils/authCleanup";
import { Loader2, Trophy, Award, Zap, Crown, Settings, User } from "lucide-react";
const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
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
  const quickLogins = [{
    type: "Master Admin",
    email: "master_admin@demo.com",
    password: "demo123456",
    description: "Full system access & user management",
    icon: Crown,
    color: "text-yellow-500"
  }, {
    type: "Admin",
    email: "admin@demo.com",
    password: "demo123456",
    description: "Admin dashboard & content management",
    icon: Settings,
    color: "text-blue-500"
  }, {
    type: "Regular User",
    email: "user@demo.com",
    password: "demo123456",
    description: "Standard user experience",
    icon: User,
    color: "text-green-500"
  }];
  // cleanup handled via utils

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({
          scope: 'global'
        });
      } catch (err) {
        // Continue even if this fails
      }
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data.user) {
        try { localStorage.setItem('lastLoginEmail', email); } catch {}
        toast({
          title: "Welcome back!",
          description: "Successfully signed in"
        });
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "An error occurred during sign in",
        variant: "destructive"
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
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      // Create approval request instead of user account
      const nameParts = displayName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      const {
        error
      } = await supabase.from('user_approval_requests').insert({
        email,
        first_name: firstName,
        last_name: lastName || null,
        reason: "User registration request"
      });
      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          toast({
            title: "Request Already Submitted",
            description: "A registration request with this email already exists. Please wait for admin approval.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }
      toast({
        title: "Registration Request Submitted!",
        description: "Your request has been sent to administrators for approval. You'll receive an email once your account is approved."
      });

      // Clear form
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleResetPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email", description: "Please enter your email above to receive a reset link.", variant: "default" });
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/force-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast({ title: "Reset link sent", description: `We emailed a password reset link to ${email}.` });
    } catch (error: any) {
      toast({ title: "Reset failed", description: error.message || "Could not send reset email", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({
          scope: 'global'
        });
      } catch (err) {
        // Continue even if this fails
      }

      // Demo credentials
      const demoEmail = "admin@demo.com";
      const demoPassword = "demo123456";

      // Try to sign in first
      const {
        data: signInData,
        error: signInError
      } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });
      if (signInData?.user && signInData?.session) {
        toast({
          title: "Welcome to Demo Mode!",
          description: "You now have admin access to edit content"
        });
        window.location.href = '/';
        return;
      }

      // Handle sign in errors
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          // Account doesn't exist, create it via edge function
          try {
            const response = await fetch(`https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/ensure-demo-account`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw`
              },
              body: JSON.stringify({ email: demoEmail })
            });

            if (!response.ok) {
              throw new Error('Failed to create demo account');
            }

            // Try signing in again after account creation
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: demoEmail,
              password: demoPassword
            });

            if (retryError) throw retryError;

            if (retryData.user && retryData.session) {
              toast({
                title: "Demo Account Ready!",
                description: "You can now use all admin features"
              });
              window.location.href = '/';
            }
          } catch (createError) {
            console.error('Error creating demo account:', createError);
            toast({
              title: "Demo Setup Failed",
              description: "Could not create demo account. Please try again.",
              variant: "destructive"
            });
          }
        } else if (signInError.message.includes('Email not confirmed') || signInError.message.includes('email_not_confirmed')) {
          toast({
            title: "Demo Account Needs Setup",
            description: "Your demo account exists but requires email confirmation. To enable instant demo access, please disable 'Confirm email' in your Supabase Auth settings.",
            variant: "default"
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
        variant: "destructive"
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
        await supabase.auth.signOut({
          scope: 'global'
        });
      } catch (err) {
        console.log('Sign out error (continuing):', err);
      }

      // Try to sign in first
      const {
        data: signInData,
        error: signInError
      } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (signInData?.user && signInData?.session) {
        localStorage.setItem('lastLoginEmail', loginEmail);
        toast({
          title: "Quick Login Successful!",
          description: `Signed in as ${quickLogins.find(q => q.email === loginEmail)?.type}`
        });
        window.location.href = '/';
        return;
      }

      // If sign in failed because account doesn't exist, create it
      if (signInError?.message.includes('Invalid login credentials')) {
        try {
          const response = await fetch(`https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/ensure-demo-account`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw`
            },
            body: JSON.stringify({ email: loginEmail })
          });

          if (!response.ok) {
            throw new Error('Failed to create demo account');
          }

          // Try signing in again after account creation
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword
          });

          if (retryError) throw retryError;

          if (retryData.user && retryData.session) {
            localStorage.setItem('lastLoginEmail', loginEmail);
            toast({
              title: "Demo Account Ready!",
              description: `You now have ${quickLogins.find(q => q.email === loginEmail)?.type} access`
            });
            window.location.href = '/';
          }
        } catch (createError) {
          console.error('Error creating demo account:', createError);
          toast({
            title: "Demo Setup Failed",
            description: "Could not create demo account. Please try again.",
            variant: "destructive"
          });
        }
      } else if (signInError?.message.includes('Email not confirmed')) {
        toast({
          title: "Demo Account Needs Setup",
          description: "Your demo account exists but requires email confirmation. To enable instant demo access, please disable 'Confirm email' in your Supabase Auth settings.",
          variant: "default"
        });
      } else if (signInError) {
        throw signInError;
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
  return <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-1 sm:px-4 py-4">
      <Helmet>
        <title>Sign In - Access Your Learning Platform | FINternship</title>
        <meta name="description" content="Sign in to FINternship Learning Platform. Track progress, earn achievements, access comprehensive financial product training, and enhance your advisory skills with AI assistance." />
        <meta name="keywords" content="sign in, login, financial advisor platform, learning platform, training portal, financial education" />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Sign In - Access Your Learning Platform | FINternship" />
        <meta property="og:description" content="Join thousands of financial advisors enhancing their skills with comprehensive product training and AI assistance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}${window.location.pathname}`} />
        <meta property="og:image" content={`${window.location.origin}/og-default.jpg`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sign In - Access Your Learning Platform | FINternship" />
        <meta name="twitter:description" content="Join thousands of financial advisors enhancing their skills with comprehensive product training." />
        <meta name="twitter:image" content={`${window.location.origin}/og-default.jpg`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Sign In - FINternship Learning Platform",
            "description": "Sign in to access comprehensive financial advisory training and education resources",
            "url": `${window.location.origin}${window.location.pathname}`,
            "isPartOf": {
              "@type": "WebSite",
              "name": "FINternship Learning Platform",
              "url": window.location.origin
            }
          })}
        </script>
      </Helmet>
      <div className="w-full max-w-lg space-y-4 sm:space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary p-4 rounded-full">
              <Trophy className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Knowledge Portal
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Choose your access level or sign in with your account
          </p>
        </div>

        {/* Quick Login Buttons */}
        <div className="grid gap-3">
          {quickLogins.map((login, index) => {
            const IconComponent = login.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="flex items-center justify-between p-4 h-auto border-border/50 hover:border-primary/50 transition-colors group"
                onClick={() => handleQuickLogin(login.email, login.password)}
                disabled={loading}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                    <IconComponent className={`h-4 w-4 ${login.color} group-hover:text-primary transition-colors`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{login.type}</div>
                    <div className="text-xs text-muted-foreground">{login.description}</div>
                  </div>
                </div>
                <Zap className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            );
          })}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or sign in with your account
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
                <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" disabled={loading} className="h-11 sm:h-10" onKeyDown={e => e.key === 'Enter' && !e.shiftKey && e.currentTarget.form?.requestSubmit()} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" disabled={loading} className="h-11 sm:h-10" onKeyDown={e => e.key === 'Enter' && !e.shiftKey && e.currentTarget.form?.requestSubmit()} />
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" variant="link" size="sm" className="px-0" onClick={handleResetPassword} disabled={loading}>
                      Forgot password?
                    </Button>
                  </div>
                  <Button type="submit" className="w-full min-h-[44px]" disabled={loading} variant="hero">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <Input id="signup-name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Enter your name" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" disabled={loading} />
                  </div>
                   <Button type="submit" className="w-full" disabled={loading} variant="hero">
                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Request Account
                   </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>;
};
export default Auth;