import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';

interface AdminContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { user } = useAuth();
  const { isMasterAdmin, hasRole, loading } = usePermissions();
  
  // Check if user has admin privileges
  const isAdmin = isMasterAdmin() || hasRole('admin');
  
  useEffect(() => {
    // Auto-enable admin mode for master admins
    if (isMasterAdmin() && !loading) {
      setIsAdminMode(true);
    }
    // Reset admin mode when user logs out
    if (!user) {
      setIsAdminMode(false);
    }
  }, [isMasterAdmin, loading, user]);

  // Debug logging
  console.log('🔧 Admin Context State:', { isAdminMode, isAdmin, hasUser: !!user, isMasterAdmin: isMasterAdmin() });

  const toggleAdminMode = () => {
    // Anyone can toggle admin mode, but effectiveness depends on actual permissions
    setIsAdminMode(!isAdminMode);
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