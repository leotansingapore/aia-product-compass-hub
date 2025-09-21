import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/authService';
import { useSimpleAuthOperations } from '@/hooks/useSimpleAuthOperations';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';

export function useAuth() {
  const navigate = useNavigate();
  const authOperations = useSimpleAuthOperations();
  const { user, signOut } = useSimplifiedAuth();

  return {
    ...authOperations,
    user,
    signOut,
    navigate
  };
}