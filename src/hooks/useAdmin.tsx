import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';

interface AdminContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(true);
  const { user } = useAuth();
  
  // For development: Enable admin mode regardless of auth state
  // In production, you'd check user roles from database
  const isAdmin = true; // Simplified for development
  
  // Debug logging
  console.log('🔧 Admin Context State:', { isAdminMode, isAdmin, hasUser: !!user });

  const toggleAdminMode = () => {
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