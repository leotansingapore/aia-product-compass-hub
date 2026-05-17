import { createContext, useContext, useMemo, ReactNode } from 'react';
import { usePermissions } from './usePermissions';
import { useViewMode } from '@/components/admin/AdminViewSwitcher';

interface AdminContextType {
  isAdmin: boolean;
  isActualAdmin: boolean; // True admin status, unaffected by view mode
  /** True while `usePermissions` is still fetching the admin role from
   * the server. Important for impersonation: callers should NOT treat
   * `isActualAdmin === false` as a signal that the user lost admin during
   * this window, because it flips false transiently on every page reload. */
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { isMasterAdmin, hasRole, loading, getUserAdminRole } = usePermissions();
  const { isViewingAsUser } = useViewMode();

  // Check if user has admin privileges - admins and master admins can access admin features
  const isActualAdmin = !loading && (isMasterAdmin() || hasRole('admin'));

  // When viewing as user, pretend we're not an admin (except for the switcher itself)
  const isAdmin = isActualAdmin && !isViewingAsUser;

  const value = useMemo(() => ({ isAdmin, isActualAdmin, loading }), [isAdmin, isActualAdmin, loading]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    // Safe fallback to avoid crashing if provider isn't mounted yet (e.g. HMR)
    return { isAdmin: false, isActualAdmin: false, loading: false };
  }
  return context;
}