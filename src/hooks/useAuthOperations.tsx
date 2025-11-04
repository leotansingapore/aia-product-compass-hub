import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { DemoService } from "@/services/demoService";

export function useAuthOperations() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn: authSignIn, signUp: authSignUp, resetPassword: authResetPassword } = useSimplifiedAuth();

  const validateFields = (fields: Record<string, string>, requiredFields: readonly string[]) => {
    const missing = requiredFields.filter(field => !fields[field]);
    if (missing.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const signIn = async (email: string, password: string) => {
    if (!validateFields({ email, password }, ['email', 'password'])) {
      return;
    }

    setLoading(true);
    try {
      await authSignIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!validateFields({ email, password, displayName }, ['email', 'password', 'displayName'])) {
      return { success: false };
    }

    setLoading(true);
    try {
      const result = await authSignUp(email, password, displayName);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email) {
      toast({
        title: "Enter your email",
        description: "Please enter your email above to receive a reset link.",
        variant: "default"
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
        const demoAccount = DemoService.getDemoAccountByEmail(email);
        toast({
          title: "Demo Account Ready!",
          description: `You now have ${demoAccount?.type} access`
        });
        window.location.href = '/';
      } else {
        toast({
          variant: "destructive",
          title: "Demo Login Failed",
          description: result.error || "An error occurred during demo login"
        });
      }
    } catch (error: any) {
      toast({
        title: "Demo Login Failed",
        description: error.message || "An error occurred during demo login",
        variant: "destructive"
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
}
