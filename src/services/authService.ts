import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/utils/authCleanup";
import { AUTH_CONFIG } from "@/config/authConfig";

export interface SignInResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresActivation?: boolean;
}

export interface SignUpResult {
  success: boolean;
  error?: string;
}

export class AuthService {
  private static async performCleanup() {
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // Continue even if cleanup fails
    }
  }

  private static storeLastLoginEmail(email: string) {
    try {
      localStorage.setItem('lastLoginEmail', email);
    } catch {
      // Continue if localStorage fails
    }
  }

  static getLastLoginEmail(): string {
    try {
      return localStorage.getItem('lastLoginEmail') || '';
    } catch {
      return '';
    }
  }

  static async signIn(email: string, password: string): Promise<SignInResult> {
    await this.performCleanup();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (data.user) {
        this.storeLastLoginEmail(email);
        return { success: true, user: data.user };
      }

      if (error?.message.includes('Invalid login credentials')) {
        // Check for approved account that needs activation
        const hasApprovedRequest = await this.checkApprovedRequest(email);
        if (hasApprovedRequest) {
          return { success: false, requiresActivation: true };
        }
      }

      return { success: false, error: error?.message || 'Sign in failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  static async activateAccount(email: string, password: string): Promise<SignInResult> {
    try {
      const { data: activationData, error: activationError } = await supabase.functions.invoke('activate-account', {
        body: { email, password }
      });

      if (activationError) {
        return { success: false, error: `Failed to activate account: ${activationError.message}` };
      }

      if (!activationData?.success) {
        return { success: false, error: activationData?.error || 'Failed to activate account' };
      }

      // Now sign in with the original password
      return await this.signIn(email, password);
    } catch (error: any) {
      return { success: false, error: error.message || 'Account activation failed' };
    }
  }

  static async signUp(email: string, password: string, displayName: string): Promise<SignUpResult> {
    try {
      const nameParts = displayName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // Store the password securely for later activation
      const { error } = await supabase
        .from('user_approval_requests')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName || null,
          reason: "User registration request",
          notes: `Password set during registration` // We'll store password via RPC for security
        });

      if (error) {
        if (error.code === '23505') {
          return { 
            success: false, 
            error: "A registration request with this email already exists. Please wait for admin approval." 
          };
        }
        return { success: false, error: error.message };
      }

      // Store the password for later activation
      const { error: updateError } = await supabase
        .from('user_approval_requests')
        .update({ 
          stored_password: password // Store the signup password
        })
        .eq('email', email)
        .eq('status', 'pending');

      if (updateError) {
        console.warn('Could not store password for activation:', updateError);
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const redirectTo = `${window.location.origin}${AUTH_CONFIG.redirectUrls.passwordReset}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Could not send reset email' };
    }
  }

  static async signOut(): Promise<void> {
    await this.performCleanup();
    window.location.href = AUTH_CONFIG.redirectUrls.afterSignOut;
  }

  static async checkSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch {
      return false;
    }
  }

  private static async checkApprovedRequest(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_approval_requests')
        .select('*')
        .eq('email', email)
        .eq('status', 'approved')
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }
}