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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] Error getting session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields"
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: error.message
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in."
        });
        // Redirect will happen automatically via auth state listener
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error) {
      console.error('Sign in error:', error);
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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: displayName?.trim() || 'User'
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: error.message
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account."
        });
      }
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
      
      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if signOut fails
      window.location.href = '/auth';
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

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Reset Failed",
          description: error.message
        });
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
    throw new Error('useSimplifiedAuth must be used within a SimplifiedAuthProvider');
  }
  return context;
};