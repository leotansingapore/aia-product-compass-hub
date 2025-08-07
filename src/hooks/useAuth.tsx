import React, { createContext, useContext } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useClerkUserSetup } from './useClerkUserSetup';

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
  const { user, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  
  // Set up user profile and roles when they sign in with Clerk
  useClerkUserSetup();

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
    user,
    session: user ? { user } : null,
    loading: !isLoaded,
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