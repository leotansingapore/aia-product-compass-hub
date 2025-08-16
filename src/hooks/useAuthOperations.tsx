import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";
import { DemoService } from "@/services/demoService";
import { AUTH_CONFIG } from "@/config/authConfig";

export function useAuthOperations() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateFields = (fields: Record<string, string>, requiredFields: readonly string[]) => {
    const missing = requiredFields.filter(field => !fields[field]);
    if (missing.length > 0) {
      toast({
        title: AUTH_CONFIG.messages.errors.missingInfo,
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const signIn = async (email: string, password: string) => {
    if (!validateFields({ email, password }, AUTH_CONFIG.validation.requiredFields.signIn)) {
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.signIn(email, password);

      if (result.success) {
        toast({
          title: AUTH_CONFIG.messages.success.signIn,
          description: "Successfully signed in"
        });
        window.location.href = AUTH_CONFIG.redirectUrls.afterSignIn;
        return;
      }

      if (result.requiresActivation) {
        const activationResult = await AuthService.activateAccount(email, password);
        
        if (activationResult.success) {
          if (activationResult.requiresPasswordChange) {
            toast({
              title: "Account Activated!",
              description: `Your account is ready! Please set a new password for security. Temporary password: ${activationResult.tempPassword}`,
              duration: 10000
            });
            // Redirect to password change page
            window.location.href = '/force-password';
          } else {
            toast({
              title: AUTH_CONFIG.messages.success.accountActivated,
              description: "Your approved account is now ready. Welcome!"
            });
            window.location.href = AUTH_CONFIG.redirectUrls.afterSignIn;
          }
          return;
        } else {
          throw new Error(activationResult.error);
        }
      }

      throw new Error(result.error);
    } catch (error: any) {
      toast({
        title: AUTH_CONFIG.messages.errors.signInFailed,
        description: error.message || "An error occurred during sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!validateFields({ email, password, displayName }, AUTH_CONFIG.validation.requiredFields.signUp)) {
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.signUp(email, password, displayName);

      if (result.success) {
        toast({
          title: AUTH_CONFIG.messages.success.signUp,
          description: "Your request has been sent for approval. Once approved, you can sign in with the password you just entered.",
          duration: 6000
        });
        return { success: true, email };
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: AUTH_CONFIG.messages.errors.registrationFailed,
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
      return { success: false };
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
      const result = await AuthService.resetPassword(email);
      
      if (result.success) {
        toast({
          title: "Reset link sent",
          description: `We emailed a password reset link to ${email}.`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Could not send reset email",
        variant: "destructive"
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
        const demoAccount = DemoService.getDemoAccountByEmail(email);
        toast({
          title: AUTH_CONFIG.messages.success.demoReady,
          description: `You now have ${demoAccount?.type} access`
        });
        window.location.href = AUTH_CONFIG.redirectUrls.afterSignIn;
      } else {
        throw new Error(result.error);
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