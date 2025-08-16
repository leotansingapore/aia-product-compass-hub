import { supabase } from "@/integrations/supabase/client";
import { AuthService, SignInResult } from "./authService";
import { AUTH_CONFIG } from "@/config/authConfig";

export class DemoService {
  private static readonly DEMO_ENDPOINT = `https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/ensure-demo-account`;
  private static readonly ANON_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw`;

  static getDemoAccounts() {
    return AUTH_CONFIG.demo.accounts;
  }

  static async signInWithDemoAccount(email: string, password: string): Promise<SignInResult> {
    const result = await AuthService.signIn(email, password);
    
    if (result.success) {
      return result;
    }

    // If sign-in failed, try to create the demo account
    if (result.error?.includes('Invalid login credentials')) {
      try {
        await this.createDemoAccount(email);
        // Retry sign-in after account creation
        return await AuthService.signIn(email, password);
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to create demo account' };
      }
    }

    if (result.error?.includes('Email not confirmed')) {
      return { 
        success: false, 
        error: "Demo account exists but requires email confirmation. Please disable 'Confirm email' in Supabase Auth settings for instant demo access." 
      };
    }

    return result;
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