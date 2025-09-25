import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSimplifiedAuth } from './useSimplifiedAuth';
import { usePermissions } from './usePermissions';

interface AdminContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { user } = useSimplifiedAuth();
  const { isMasterAdmin, hasRole, loading } = usePermissions();
  
    // Check if user has admin privileges - admins and master admins can access admin mode
    const isAdmin = !loading && (isMasterAdmin() || hasRole('admin'));
  
  useEffect(() => {
    // Reset admin mode when user logs out or loses admin privileges
    if (!user || !isAdmin) {
      setIsAdminMode(false);
    }
  }, [user, isAdmin]);

  // Debug logging
  console.log('🔧 Admin Context State:', { isAdminMode, isAdmin, hasUser: !!user, isMasterAdmin: isMasterAdmin() });

  const toggleAdminMode = () => {
    // Only admins can toggle admin mode
    if (isAdmin) {
      setIsAdminMode(!isAdminMode);
    }
  };

  useEffect(() => {
    // Reset admin mode when user logs out
    if (!user) {
      setIsAdminMode(false);
    }
  }, [user]);

  return (
    <AdminContext.Provider value={{ isAdminMode, toggleAdminMode, isAdmin }}>
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