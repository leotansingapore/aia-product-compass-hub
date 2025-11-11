import { createContext, useContext, ReactNode } from 'react';
import { usePermissions } from './usePermissions';

interface AdminContextType {
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { isMasterAdmin, hasRole, loading, getUserAdminRole } = usePermissions();
  
  // Check if user has admin privileges - admins and master admins can access admin features
  const isAdmin = !loading && (isMasterAdmin() || hasRole('admin'));

  // Debug logging to help diagnose permission issues
  console.log('[AdminProvider] Permission check:', {
    loading,
    userAdminRole: getUserAdminRole(),
    isMasterAdmin: isMasterAdmin(),
    hasAdminRole: hasRole('admin'),
    finalIsAdmin: isAdmin
  });

  return (
    <AdminContext.Provider value={{ isAdmin }}>
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