import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/utils/authCleanup";

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  needsApproval?: boolean;
}

export class SimpleAuthService {
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

  static async signIn(email: string, password: string): Promise<AuthResult> {
    console.log('[SimpleAuthService] Starting sign in for:', email);
    await this.performCleanup();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('[SimpleAuthService] Sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('[SimpleAuthService] User signed in:', data.user.id);
        this.storeLastLoginEmail(email);
        
        // Demo accounts bypass approval check
        const isDemoAccount = email.includes('@demo.com');
        console.log('[SimpleAuthService] Is demo account:', isDemoAccount);
        if (isDemoAccount) {
          console.log('[SimpleAuthService] Demo account - bypassing role check');
          return { success: true, user: data.user };
        }
        
        // Check if user has any roles (is approved)
        console.log('[SimpleAuthService] Checking user roles...');
        const hasRole = await this.checkUserHasRole(data.user.id);
        console.log('[SimpleAuthService] User has role:', hasRole);
        if (!hasRole) {
          return { success: true, user: data.user, needsApproval: true };
        }
        
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error: any) {
      console.error('[SimpleAuthService] Unexpected error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  static async signUp(email: string, password: string, displayName: string): Promise<AuthResult> {
    await this.performCleanup();

    try {
      const nameParts = displayName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName || '',
            display_name: displayName
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // User created successfully but needs approval
        return { success: true, user: data.user, needsApproval: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const redirectUrl = `${window.location.origin}/force-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
      
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
    window.location.href = '/auth';
  }

  static async checkSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch {
      return false;
    }
  }

  static async checkUserHasRole(userId: string): Promise<boolean> {
    try {
      console.log('[SimpleAuth] Checking user role for:', userId);
      const { data, error } = await supabase.rpc('user_has_any_role', { user_id: userId });
      console.log('[SimpleAuth] Role check result:', { data, error });
      return !error && !!data;
    } catch (error) {
      console.error('[SimpleAuth] Role check failed:', error);
      return false;
    }
  }
}