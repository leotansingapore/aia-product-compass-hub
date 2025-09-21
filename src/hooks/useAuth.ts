import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import { useSimpleAuthOperations } from '@/hooks/useSimpleAuthOperations';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';

export function useAuth() {
  const navigate = useNavigate();
  const authOperations = useSimpleAuthOperations();
  const { user, signOut } = useSimplifiedAuth();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const isLoggedIn = await AuthService.checkSession();
      if (isLoggedIn) {
        // Force redirect to avoid any caching issues
        window.location.replace('/');
      }
    };
    checkUser();
  }, []);

  return {
    ...authOperations,
    user,
    signOut,
    navigate
  };
}