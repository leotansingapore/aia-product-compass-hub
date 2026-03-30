import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

// Version to bust cache when permission logic changes
const PERMISSIONS_VERSION = 3; // Increment this when role logic changes

// Cache for user permissions to prevent unnecessary re-fetches
const permissionsCache = new Map<string, {
  adminRole: string;
  timestamp: number;
  version: number;
}>();
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Export function to manually clear permissions cache
export const clearPermissionsCache = (userId?: string) => {
  if (userId) {
    permissionsCache.delete(userId);
    console.log('[Permissions] Cache cleared for user:', userId);
  } else {
    permissionsCache.clear();
    console.log('[Permissions] All caches cleared');
  }
};

// Safe hook wrapper to handle auth context not being available during initialization
const useSimplifiedAuthSafe = () => {
  try {
    return useSimplifiedAuth();
  } catch (error) {
    console.log('[Auth Hook] SimplifiedAuth context not available:', error);
    // Return safe defaults when auth context is not available
    return { user: null, loading: true };
  }
};

export function usePermissions() {
  const { user } = useSimplifiedAuthSafe();
  const [userAdminRole, setUserAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  const fetchUserPermissions = useCallback(async () => {
    if (!user || hasInitialized.current) return;
    
    hasInitialized.current = true;
    setLoading(true);
    
    // Check cache first
    const cacheKey = user.id;
    const cached = permissionsCache.get(cacheKey);
    if (cached && 
        Date.now() - cached.timestamp < CACHE_DURATION && 
        cached.version === PERMISSIONS_VERSION) {
      console.log('[Permissions] Using cached permissions:', { 
        adminRole: cached.adminRole 
      });
      setUserAdminRole(cached.adminRole);
      setLoading(false);
      return;
    }
    
    // Clear stale cache if version mismatch
    if (cached && cached.version !== PERMISSIONS_VERSION) {
      console.log('[Permissions] Cache version mismatch, clearing cache');
      permissionsCache.delete(cacheKey);
    }
    
    try {
      // Get user's admin role
      const { data: adminRoleData, error: adminRoleError } = await supabase.rpc('get_user_admin_role', {
        user_id: user.id
      });

      if (adminRoleError) {
        console.error('Error fetching user admin role:', adminRoleError);
        setUserAdminRole('user');
      } else {
        setUserAdminRole(adminRoleData || 'user');
      }

      // Cache the results with version
      const permissionsData = {
        adminRole: adminRoleData || 'user',
        timestamp: Date.now(),
        version: PERMISSIONS_VERSION
      };
      
      console.log('[Permissions] Fetched and cached new permissions:', {
        userId: user.id,
        adminRole: permissionsData.adminRole,
        version: permissionsData.version
      });
      
      permissionsCache.set(user.id, permissionsData);
    } catch (error) {
      console.error('Error in fetchUserPermissions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !hasInitialized.current) {
      fetchUserPermissions();
    } else if (!user) {
      // Reset state when user logs out
      setUserAdminRole(null);
      setLoading(false);
      hasInitialized.current = false;
    }
  }, [user, fetchUserPermissions]);

  // Silent refresh when tab becomes visible - doesn't trigger loading state
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user) {
        // Avoid focus-time role refresh while watching videos to prevent unnecessary player-side interruptions.
        const path = window.location.pathname;
        const isVideoRoute = path.includes('/video/');
        if (isVideoRoute) return;

        console.log('[Permissions] Tab became visible, performing silent refresh...');
        
        try {
          const { data: newRole } = await supabase.rpc('get_user_admin_role', { user_id: user.id });
          const roleValue = newRole || 'user';

          // Only update state if values actually changed
          if (roleValue !== userAdminRole) {
            console.log('[Permissions] Silent refresh detected changes:', { 
              oldRole: userAdminRole, newRole: roleValue 
            });
            
            setUserAdminRole(roleValue);

            // Update cache
            permissionsCache.set(user.id, {
              adminRole: roleValue,
              timestamp: Date.now(),
              version: PERMISSIONS_VERSION
            });
          } else {
            console.log('[Permissions] Silent refresh - no changes detected');
          }
        } catch (error) {
          console.warn('[Permissions] Silent refresh failed:', error);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, userAdminRole]);

  // If no user, set loading to false immediately
  useEffect(() => {
    if (!user) {
      setLoading(false);
    }
  }, [user]);

  const hasRole = (role: string): boolean => {
    return userAdminRole === role;
  };

  const isMasterAdmin = (): boolean => {
    return userAdminRole === 'master_admin';
  };

  const isAdmin = (): boolean => {
    return userAdminRole === 'admin' || userAdminRole === 'master_admin';
  };

  const getUserAdminRole = (): string | null => {
    return userAdminRole;
  };

  // Simplified: All authenticated users can access all sections
  const canAccessSection = (sectionId: string): boolean => {
    const publicSections = ['auth', 'how_to_use'];
    if (publicSections.includes(sectionId)) return true;
    if (loading) return true;
    if (!user) return false;
    return true; // All authenticated users can view everything
  };

  // Simplified: All authenticated users can access all pages
  const canAccessPage = (pageId: string): boolean => {
    if (pageId === 'auth') return true;
    if (!user) return false;
    return true; // All authenticated users can access all pages
  };

  // Only admins can edit
  const canEditSection = (sectionId: string): boolean => {
    return isAdmin();
  };

  const canEditPage = (pageId: string): boolean => {
    return isMasterAdmin();
  };

  const canAccessTab = (tabId: string): boolean => {
    return canAccessPage(tabId);
  };

  const canEditTab = (tabId: string): boolean => {
    return isMasterAdmin();
  };

  // Simplified permission getters
  const getSectionPermission = (sectionId: string) => {
    return {
      permission_type: canAccessSection(sectionId) ? 'view' : 'hidden',
      lock_message: !canAccessSection(sectionId) ? 'Please log in to access this content' : undefined
    };
  };

  const getPagePermission = (pageId: string) => {
    return {
      permission_type: canAccessPage(pageId) ? 'view' : 'hidden',
      lock_message: !canAccessPage(pageId) ? 'Please log in to access this content' : undefined
    };
  };

  const getTabPermission = (tabId: string) => {
    return {
      permission_type: canAccessTab(tabId) ? 'view' : 'hidden',
      lock_message: !canAccessTab(tabId) ? 'Please log in to access this content' : undefined
    };
  };

  const isSectionLocked = (sectionId: string): boolean => {
    return false;
  };

  const isPageLocked = (pageId: string): boolean => {
    return false;
  };

  const isTabLocked = (tabId: string): boolean => {
    return false;
  };

  return {
    userAdminRole,
    loading,
    hasRole,
    isMasterAdmin,
    isAdmin,
    getUserAdminRole,
    // Section permissions
    getSectionPermission,
    canAccessSection,
    canEditSection,
    isSectionLocked,
    // Page permissions
    getPagePermission,
    canAccessPage,
    canEditPage,
    isPageLocked,
    // Tab permissions
    getTabPermission,
    canAccessTab,
    canEditTab,
    isTabLocked,
    refetch: fetchUserPermissions
  };
}
