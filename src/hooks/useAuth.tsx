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
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.info('[Auth] onAuthStateChange:', { event, hasSession: !!session, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const userHasRole = await SimpleAuthService.checkUserHasRole(session.user.id);
            if (mounted) setHasRole(userHasRole);
          } catch (error) {
            console.error('[Auth] Error checking user role:', error);
            if (mounted) setHasRole(false);
          }
        } else {
          if (mounted) setHasRole(false);
        }
        
        if (mounted) setLoading(false);
      }
    );

    // Check for existing session with timeout
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('[Auth] Session error:', error);
          setSession(null);
          setUser(null);
          setHasRole(false);
          setLoading(false);
          return;
        }
        
        console.info('[Auth] Initial session loaded:', { hasSession: !!session, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const userHasRole = await SimpleAuthService.checkUserHasRole(session.user.id);
            if (mounted) setHasRole(userHasRole);
          } catch (error) {
            console.error('[Auth] Error checking user role:', error);
            if (mounted) setHasRole(false);
          }
        } else {
          if (mounted) setHasRole(false);
        }
        
        if (mounted) setLoading(false);
      } catch (error) {
        console.error('[Auth] Fatal session error:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setHasRole(false);
          setLoading(false);
        }
      }
    };

    // Add timeout fallback
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Loading timeout - setting to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    checkSession();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
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