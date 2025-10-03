import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
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
      console.log('[SimplifiedAuth] Calling supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      console.log('[SimplifiedAuth] Sign in response:', { 
        hasUser: !!data.user, 
        hasError: !!error, 
        errorMessage: error?.message 
      });

      if (error) {
        console.error('[SimplifiedAuth] Sign in error:', error);
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: error.message
        });
        return;
      }

      if (data.user) {
        console.log('[SimplifiedAuth] Sign in successful, user:', data.user.email);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in."
        });
        // Let React Router handle navigation instead of hard redirect
      }
    } catch (error) {
      console.error('[SimplifiedAuth] Unexpected sign in error:', error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "An unexpected error occurred"
      });
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      // Create approval request instead of direct signup
      const [firstName, lastName] = (displayName?.trim() || '').split(' ', 2);
      
        const { error } = await supabase
          .from('user_approval_requests')
          .insert({
            email: email.trim(),
            first_name: firstName || '',
            last_name: lastName || '',
            stored_password: password.trim(),
            status: 'pending'
          });

        if (error) {
          // Check if user already requested approval
          if ((error as any).code === '23505') { // unique constraint violation
            toast({
              variant: "destructive",
              title: "Request Already Exists",
              description: "An approval request for this email already exists. Please wait for admin approval."
            });
            return;
          }
          
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message
          });
          return;
        }

        toast({
          title: "Registration Request Submitted!",
          description: "Your account request has been submitted for admin approval. You'll be able to sign in once approved."
        });
        
        // Optional: guide users to the awaiting approval page
        setTimeout(() => {
          try { window.location.href = '/awaiting-approval'; } catch {}
        }, 800);
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "An unexpected error occurred"
      });
    }
  };

  const signOut = async () => {
    try {
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
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email: email.trim() }
      });

      console.log('[SimplifiedAuth] Reset response:', { data, error });

      if (error) {
        console.error('Reset password error:', error);
        toast({
          variant: "destructive",
          title: "Reset Failed",
          description: "Failed to send reset email. Please try again."
        });
        return;
      }

      if (data?.error) {
        console.error('Reset password error details:', data.details);
        
        // Show specific error message for domain verification issues
        if (data.error.includes('verify a domain')) {
          toast({
            variant: "destructive",
            title: "Email Service Configuration",
            description: "The email service requires domain verification. Please contact support or try again later."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Reset Failed",
            description: data.error
          });
        }
        return;
      }

      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions"
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
      signUp: async () => {},
      signOut: async () => {},
      resetPassword: async () => {}
    };
  }
  return context;
};