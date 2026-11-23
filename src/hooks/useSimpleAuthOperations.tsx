import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';

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

  return {
    loading,
    signIn,
    resetPassword
  };
};
