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
      console.log('🔧 Fetching Supabase user for email:', email);
      
      // Special handling for admin email
      if (email === 'tanjunsing@gmail.com') {
        console.log('🔧 Admin email detected, checking admin user setup');
        
        // Try to get admin user_id from user_roles first
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'master_admin')
          .limit(1);
          
        console.log('🔧 Admin role lookup result:', { roleData, roleError });
        
        if (roleData && roleData.length > 0) {
          const adminUserId = roleData[0].user_id;
          console.log('🔧 Found admin user_id:', adminUserId);
          
          // Get the profile for this user_id
          const { data: adminProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', adminUserId)
            .single();
            
          if (!profileError && adminProfile) {
            console.log('🔧 Found admin profile:', adminProfile);
            setUser({
              id: adminProfile.user_id,
              email: email,
              primaryEmailAddress: clerkUser.primaryEmailAddress,
              emailAddresses: clerkUser.emailAddresses,
              ...adminProfile
            });
            setLoading(false);
            return;
          }
        }
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('🔧 Error fetching user profile:', error);
        setUser(null);
      } else {
        console.log('🔧 Found user profile:', profile);
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
      console.error('🔧 Error fetching user:', error);
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