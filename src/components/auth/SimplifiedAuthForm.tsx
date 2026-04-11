import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

export function SimplifiedAuthForm() {
  const { signIn, resetPassword } = useSimplifiedAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (formData.email) {
      setFormData(prev => ({ ...prev, resetEmail: prev.email }));
    }
    setActiveTab('reset');
  };

  if (activeTab === 'reset') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-sans">Reset password</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground font-sans">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
      </div>

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
      </form>
    </div>
  );
}
