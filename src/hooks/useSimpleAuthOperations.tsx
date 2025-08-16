import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SimpleAuthService } from '@/services/simpleAuthService';
import { DemoService } from '@/services/demoService';

export const useSimpleAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateFields = (fields: Record<string, string>, requiredFields: readonly string[]) => {
    return requiredFields.every(field => fields[field]?.trim());
  };

  const signIn = async (email: string, password: string) => {
    if (!validateFields({ email, password }, ['email', 'password'])) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await SimpleAuthService.signIn(email, password);
      
      if (result.success) {
        if (result.needsApproval) {
          // User exists but needs approval
          window.location.href = '/awaiting-approval';
        } else {
          // User is approved, redirect to dashboard
          toast({
            title: "Welcome back!",
            description: "Successfully signed in."
          });
          window.location.href = '/';
        }
      } else {
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: result.error || "Invalid login credentials"
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!validateFields({ email, password, displayName }, ['email', 'password', 'displayName'])) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields"
      });
      return { success: false };
    }

    setLoading(true);
    try {
      const result = await SimpleAuthService.signUp(email, password, displayName);
      
      if (result.success) {
        toast({
          title: "Account Created!",
          description: "Your account is awaiting admin approval. You'll be notified once approved."
        });
        // Redirect to awaiting approval page
        setTimeout(() => {
          window.location.href = '/awaiting-approval';
        }, 1000);
        return { success: true, email };
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.error || "Unable to create account"
        });
        return { success: false };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An unexpected error occurred"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email?.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await SimpleAuthService.resetPassword(email);
      
      if (result.success) {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Reset Failed",
          description: result.error || "Unable to send reset email"
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const demoSignIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await DemoService.signInWithDemoAccount(email, password);
      
      if (result.success) {
        toast({
          title: "Demo Account Ready!",
          description: "Exploring the platform with demo access"
        });
        window.location.href = '/';
      } else {
        toast({
          variant: "destructive",
          title: "Demo Login Failed",
          description: result.error || "Unable to access demo account"
        });
      }
    } catch (error) {
      console.error('Demo sign in error:', error);
      toast({
        variant: "destructive",
        title: "Demo Login Failed",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signIn,
    signUp,
    resetPassword,
    demoSignIn
  };
};