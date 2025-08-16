import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';
import { SimpleAuthService } from '@/services/simpleAuthService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  hasRole: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.info('[Auth] onAuthStateChange:', { event, hasSession: !!session, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user has role after login
          setTimeout(async () => {
            const userHasRole = await SimpleAuthService.checkUserHasRole(session.user.id);
            setHasRole(userHasRole);
            setLoading(false);
            
            // Redirect users without roles to awaiting approval
            if (!userHasRole && window.location.pathname === '/') {
              window.location.href = '/awaiting-approval';
            }
          }, 0);
        } else {
          setHasRole(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.info('[Auth] Initial session loaded:', { hasSession: !!session, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userHasRole = await SimpleAuthService.checkUserHasRole(session.user.id);
        setHasRole(userHasRole);
        
        // Redirect users without roles to awaiting approval
        if (!userHasRole && window.location.pathname === '/') {
          window.location.href = '/awaiting-approval';
        }
      } else {
        setHasRole(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await SimpleAuthService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if signOut fails
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};