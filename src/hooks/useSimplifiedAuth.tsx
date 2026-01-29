import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { clearPermissionsCache } from '@/hooks/usePermissions';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; email?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const SimplifiedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // First, check for existing session immediately
    const initializeAuth = async () => {
      try {
        console.log('[SimplifiedAuth] Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting initial session:', error);
        }
        
        if (mounted && session) {
          console.log('[Auth] Found existing session for:', session.user?.email);
          setSession(session);
          setUser(session.user);
          setLoading(false);
        } else if (mounted) {
          console.log('[Auth] No existing session found');
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener after checking initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('[SimplifiedAuth] Auth state change:', event, 'hasUser:', !!session?.user, 'userEmail:', session?.user?.email);
        
        // Clear permissions cache on sign out
        if (event === 'SIGNED_OUT') {
          clearPermissionsCache();
        }
        
        // Update state for all auth events
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've processed the initial session
        if (event !== 'INITIAL_SESSION' || session !== null) {
          setLoading(false);
        }
        
        console.log('[SimplifiedAuth] Updated state - user:', !!session?.user, 'loading: false');
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[SimplifiedAuth] Starting sign in for:', email);
    
    if (!email.trim() || !password.trim()) {
      console.log('[SimplifiedAuth] Missing fields');
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields"
      });
      return;
    }

    try {
      // Step 1: Check if user exists in Academy
      console.log('[SimplifiedAuth] Checking if user exists in Academy...');
      const { data: existsCheck, error: existsError } = await supabase.functions.invoke(
        "check-academy-user-exists",
        { body: { email: email.trim() } }
      );

      console.log('[SimplifiedAuth] User exists check:', { existsCheck, existsError });

      if (existsCheck?.exists) {
        // User EXISTS in Academy - try normal password login
        console.log('[SimplifiedAuth] User exists, attempting password login...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (!error && data.user) {
          console.log('[SimplifiedAuth] Sign in successful, user:', data.user.email);
          clearPermissionsCache(data.user.id);
          toast({
            title: "Welcome back!",
            description: "Successfully signed in."
          });
          return;
        }

        // Wrong password for existing user
        console.log('[SimplifiedAuth] Wrong password for existing user');
        toast({
          variant: "destructive",
          title: "Invalid Credentials",
          description: "The password you entered is incorrect."
        });
        return;
      }

      // Step 2: User does NOT exist in Academy - check Financial app eligibility (with password verification)
      console.log('[SimplifiedAuth] User does not exist, checking Financial app eligibility with password...');
      const { data: eligibility, error: eligibilityError } = await supabase.functions.invoke(
        "check-financial-eligibility",
        { body: { 
          email: email.trim(),
          password: password.trim()  // Send password for verification
        } }
      );

      console.log('[SimplifiedAuth] Eligibility response:', { eligibility, eligibilityError });

      if (!eligibility?.eligible) {
        // Not eligible - show appropriate error
        if (eligibility?.reason === "User not approved") {
          toast({
            variant: "destructive",
            title: "Account Pending",
            description: "Your account is pending approval. Please contact your administrator."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Account Not Found",
            description: "No account found with this email. Please sign up or contact your administrator."
          });
        }
        return;
      }

      // Step 3: User is eligible - auto-provision and login
      console.log('[SimplifiedAuth] User is eligible, provisioning account...');
      const { data: provision, error: provisionError } = await supabase.functions.invoke(
        "provision-financial-user",
        {
          body: {
            email: email.trim(),
            password: password.trim(),
            full_name: eligibility.user?.full_name
          }
        }
      );

      console.log('[SimplifiedAuth] Provision response:', { provision, provisionError });

      if (provision?.session) {
        // Set the session manually to log them in
        console.log('[SimplifiedAuth] Setting session...');
        await supabase.auth.setSession({
          access_token: provision.session.access_token,
          refresh_token: provision.session.refresh_token,
        });

        toast({
          title: "Welcome to the Academy!",
          description: "Your account has been created and you're now logged in."
        });
        return;
      }

      if (provision?.user_created) {
        // Account was created but session failed - ask them to try logging in
        toast({
          title: "Account Created!",
          description: "Your account has been created. Please try logging in again."
        });
        return;
      }

      // Fallback error
      console.error('[SimplifiedAuth] Provision failed:', provision?.error || provisionError);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: provision?.error || "Unable to create your account. Please try again."
      });
    } catch (error) {
      console.error('[SimplifiedAuth] Unexpected sign in error:', error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "An unexpected error occurred"
      });
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<{ success: boolean; email?: string }> => {
    if (!email.trim() || !displayName?.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return { success: false };
    }

    try {
      const [firstName, lastName] = (displayName?.trim() || '').split(' ', 2);
      
      console.log('[SimplifiedAuth] Creating pending user via edge function');
      
      // Call edge function to create inactive auth account
      const { data, error } = await supabase.functions.invoke('create-pending-user', {
        body: {
          email: email.trim(),
          firstName: firstName || '',
          lastName: lastName || '',
          reason: 'User registration request'
        }
      });

      // Check for error in response data first (this has the actual error message)
      if (data?.error) {
        console.log('[SimplifiedAuth] Registration blocked:', data.error);
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: data.error
        });
        return { success: false };
      }

      // Check for generic function error (less helpful message)
      if (error) {
        console.log('[SimplifiedAuth] Edge function error (expected for validation)');
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "An error occurred during registration. Please try again."
        });
        return { success: false };
      }

      console.log('[SimplifiedAuth] Pending user created successfully');
      
      toast({
        title: "Registration Request Submitted!",
        description: "Your account request has been submitted for admin approval. You'll receive an email with a link to set your password once approved."
      });
      
      // Persist email for the awaiting page
      try { localStorage.setItem('pendingApprovalEmail', email.trim()); } catch {
        console.log('Could not store email in localStorage');
      }
      
      return { success: true, email: email.trim() };
    } catch (error: any) {
      console.log('[SimplifiedAuth] Unexpected signup error handled');
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error?.message || "An unexpected error occurred"
      });
      return { success: false };
    }
  };

  const signOut = async () => {
    try {
      // Clear permissions cache before signing out
      clearPermissionsCache();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Only clear specific cached data, not all localStorage
      // Let Supabase handle its own token cleanup
      
      // Let the app handle routing naturally
    } catch (error) {
      console.error('Sign out error:', error);
      // Let React Router handle error case too
    }
  };

  const resetPassword = async (email: string) => {
    console.log('[SimplifiedAuth] Reset password called for:', email);
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
      console.log('[SimplifiedAuth] Calling send-password-reset function');
      
      // Use fetch with proper headers to get status code
      const response = await fetch(
        `https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/send-password-reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw'
          },
          body: JSON.stringify({ email: email.trim() })
        }
      );

      const data = await response.json();
      console.log('[SimplifiedAuth] Reset response:', { status: response.status, data });

      // Handle rate limiting (429 status)
      if (response.status === 429) {
        console.log('⚠️ Rate limit exceeded');
        toast({
          variant: "destructive",
          title: "Too Many Attempts",
          description: data.error || "You've tried too many times. Please wait 24 hours before trying again."
        });
        return;
      }

      // Handle other errors
      if (!response.ok) {
        console.error('Reset password error:', data);
        
        // Show specific error message for domain verification issues
        if (data.error?.includes('verify a domain')) {
          toast({
            variant: "destructive",
            title: "Email Service Configuration",
            description: "The email service requires domain verification. Please contact support or try again later."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Reset Failed",
            description: data.error || "Failed to send reset email. Please try again."
          });
        }
        return;
      }

      // Success - use neutral message to prevent email enumeration
      toast({
        title: "Reset Request Received",
        description: "If an account with this email exists, you'll receive a password reset link."
      });
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

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSimplifiedAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a safe default during initialization
    return {
      user: null,
      session: null,
      loading: true,
      signIn: async () => {},
      signUp: async () => ({ success: false }),
      signOut: async () => {},
      resetPassword: async () => {}
    };
  }
  return context;
};