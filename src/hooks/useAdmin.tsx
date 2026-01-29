import { createContext, useContext, ReactNode } from 'react';
import { usePermissions } from './usePermissions';
import { useViewMode } from '@/components/admin/AdminViewSwitcher';

interface AdminContextType {
  isAdmin: boolean;
  isActualAdmin: boolean; // True admin status, unaffected by view mode
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { isMasterAdmin, hasRole, loading, getUserAdminRole } = usePermissions();
  const { isViewingAsUser } = useViewMode();
  
  // Check if user has admin privileges - admins and master admins can access admin features
  const isActualAdmin = !loading && (isMasterAdmin() || hasRole('admin'));
  
  // When viewing as user, pretend we're not an admin (except for the switcher itself)
  const isAdmin = isActualAdmin && !isViewingAsUser;

  // Debug logging to help diagnose permission issues
  console.log('[AdminProvider] Permission check:', {
    loading,
    userAdminRole: getUserAdminRole(),
    isMasterAdmin: isMasterAdmin(),
    hasAdminRole: hasRole('admin'),
    isViewingAsUser,
    finalIsAdmin: isAdmin
  });

  return (
    <AdminContext.Provider value={{ isAdmin, isActualAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}