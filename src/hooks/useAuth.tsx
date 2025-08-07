import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        fetchSupabaseUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    }
  }, [clerkUser, isLoaded]);

  const fetchSupabaseUser = async () => {
    if (!clerkUser?.primaryEmailAddress?.emailAddress) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const email = clerkUser.primaryEmailAddress.emailAddress;
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } else {
        // Create a user object that combines Clerk data with Supabase profile
        setUser({
          id: profile.user_id, // Use Supabase user_id
          email: email,
          primaryEmailAddress: clerkUser.primaryEmailAddress,
          emailAddresses: clerkUser.emailAddresses,
          ...profile
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/auth';
    }
  };

  const authValue = {
    user: user || null,
    session: user ? { user } : null,
    loading: loading,
    signOut
  };

  return (
    <AuthContext.Provider value={authValue}>
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