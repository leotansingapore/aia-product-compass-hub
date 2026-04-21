import { useSimpleAuthOperations } from '@/hooks/useSimpleAuthOperations';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';

export function useAuth() {
  const authOperations = useSimpleAuthOperations();
  const { user, signOut } = useSimplifiedAuth();

  return {
    ...authOperations,
    user,
    signOut,
  };
}
