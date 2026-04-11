import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { DemoService } from '@/services/demoService';

export const useSimpleAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn: authSignIn, resetPassword: authResetPassword } = useSimplifiedAuth();

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
      await authSignIn(email, password);
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
      await authResetPassword(email);
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
    resetPassword,
    demoSignIn
  };
};
