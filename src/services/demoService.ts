import { supabase } from "@/integrations/supabase/client";
import { AUTH_CONFIG } from "@/config/authConfig";

export interface SignInResult {
  success: boolean;
  error?: string;
  requiresActivation?: boolean;
}

export class DemoService {
  private static readonly DEMO_ENDPOINT = `https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/ensure-demo-account`;
  private static readonly ANON_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw`;

  static getDemoAccounts() {
    return AUTH_CONFIG.demo.accounts;
  }

  static async signInWithDemoAccount(email: string, password: string): Promise<SignInResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If sign-in failed, try to create the demo account
        if (error.message.includes('Invalid login credentials')) {
          try {
            await this.createDemoAccount(email);
            // Retry sign-in after account creation
            const retryResult = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (retryResult.error) {
              return { success: false, error: retryResult.error.message };
            }
            
            return { success: true };
          } catch (createError: any) {
            return { success: false, error: createError.message || 'Failed to create demo account' };
          }
        }

        if (error.message.includes('Email not confirmed')) {
          return { 
            success: false, 
            error: "Demo account exists but requires email confirmation. Please disable 'Confirm email' in Supabase Auth settings for instant demo access." 
          };
        }

        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  private static async createDemoAccount(email: string): Promise<void> {
    const response = await fetch(this.DEMO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.ANON_KEY}`
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error('Failed to create demo account');
    }
  }

  static getDemoAccountByEmail(email: string) {
    return AUTH_CONFIG.demo.accounts.find(account => account.email === email);
  }

  static isDemoEmail(email: string): boolean {
    return AUTH_CONFIG.demo.accounts.some(account => account.email === email);
  }
}
