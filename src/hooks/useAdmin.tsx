import { createContext, useContext, ReactNode } from 'react';
import { usePermissions } from './usePermissions';

interface AdminContextType {
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { isMasterAdmin, hasRole, loading } = usePermissions();
  
  // Check if user has admin privileges - admins and master admins can access admin features
  const isAdmin = !loading && (isMasterAdmin() || hasRole('admin'));

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