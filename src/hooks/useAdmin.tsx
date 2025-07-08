import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';

interface AdminContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { user } = useAuth();
  
  // For now, we'll consider all logged-in users as admin
  // In production, you'd check user roles from database
  const isAdmin = !!user;

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