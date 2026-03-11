import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Info } from 'lucide-react';

export function SimplifiedAuthForm() {
  const { signIn, signUp, resetPassword } = useSimplifiedAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    resetEmail: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await signIn(formData.email, formData.password);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    try {
      const result = await signUp(formData.email, formData.password, formData.displayName);
      if (result.success) {
        navigate(`/awaiting-approval?email=${encodeURIComponent(formData.email)}`);
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    try {
      await resetPassword(formData.resetEmail || formData.email);
    } finally {
      setIsResetting(false);
    }
  };

  const switchToForgotPassword = () => {
    // Pre-fill reset email with whatever they've typed in sign-in
    if (formData.email) {
      setFormData(prev => ({ ...prev, resetEmail: prev.email }));
    }
    setActiveTab('reset');
  };

  return (
    <Card className="w-full shadow-lg border-border/60">
      <CardContent className="p-6 !pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Only show Sign In / Sign Up tabs — Forgot Password is accessed via inline link */}
          <TabsList className="grid w-full grid-cols-2 mb-5">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* ── SIGN IN ── */}
          <TabsContent value="signin" className="space-y-4 mt-0">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <button
                    type="button"
                    onClick={switchToForgotPassword}
                    className="text-xs text-primary hover:underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSigningIn}>
                {isSigningIn ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</>
                ) : 'Sign In'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" onClick={() => setActiveTab('signup')} className="text-primary hover:underline underline-offset-2">
                  Request access
                </button>
              </p>
            </form>
          </TabsContent>

          {/* ── SIGN UP ── */}
          <TabsContent value="signup" className="space-y-4 mt-0">
            <Alert className="bg-primary/5 border-primary/20 py-3">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <AlertDescription className="text-xs text-muted-foreground">
                New accounts require admin approval. You'll be notified by email once approved.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signup-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="pl-10"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSigningUp}>
                {isSigningUp ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting request…</>
                ) : 'Request Access'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => setActiveTab('signin')} className="text-primary hover:underline underline-offset-2">
                  Sign in
                </button>
              </p>
            </form>
          </TabsContent>

          {/* ── FORGOT PASSWORD ── */}
          <TabsContent value="reset" className="space-y-4 mt-0">
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.resetEmail || formData.email}
                    onChange={(e) => handleInputChange('resetEmail', e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</>
                ) : 'Send Reset Link'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Remember your password?{' '}
                <button type="button" onClick={() => setActiveTab('signin')} className="text-primary hover:underline underline-offset-2">
                  Back to sign in
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
