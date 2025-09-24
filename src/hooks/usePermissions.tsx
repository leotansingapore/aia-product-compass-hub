import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

// Cache for user permissions to prevent unnecessary re-fetches
const permissionsCache = new Map<string, {
  tier: string;
  adminRole: string;
  permissions: { access_type: string; resource_id: string; }[];
  timestamp: number;
}>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

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
  const [userTier, setUserTier] = useState<string | null>(null);
  const [userAdminRole, setUserAdminRole] = useState<string | null>(null);
  const [tierPermissions, setTierPermissions] = useState<{ access_type: string; resource_id: string; }[]>([]);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  const fetchUserPermissions = useCallback(async () => {
    if (!user || hasInitialized.current) return;
    
    hasInitialized.current = true;
    setLoading(true);
    
    // Check cache first
    const cacheKey = user.id;
    const cached = permissionsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setUserTier(cached.tier);
      setUserAdminRole(cached.adminRole);
      setTierPermissions(cached.permissions);
      setLoading(false);
      return;
    }
    
    try {
      // Get user's access tier
      const { data: tierData, error: tierError } = await supabase.rpc('get_user_access_tier', {
        user_id: user.id
      });

      if (tierError) {
        console.error('Error fetching user access tier:', tierError);
        setUserTier('basic');
      } else {
        setUserTier(tierData || 'basic');
      }

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

      // Fetch tier permissions based on access tier
      const accessTier = tierData || 'basic';
      const { data: permissions, error: permissionsError } = await supabase
        .from('tier_permissions')
        .select('access_type, resource_id')
        .eq('tier_level', accessTier);

      if (permissionsError) {
        console.error('Error fetching tier permissions:', permissionsError);
      } else {
        setTierPermissions(permissions || []);
      }

      // Cache the results
      permissionsCache.set(user.id, {
        tier: tierData || 'basic',
        adminRole: adminRoleData || 'user',
        permissions: permissions || [],
        timestamp: Date.now()
      });
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
      setUserTier(null);
      setUserAdminRole(null);
      setTierPermissions([]);
      setLoading(false);
      hasInitialized.current = false;
    }
  }, [user, fetchUserPermissions]);

  // If no user, set loading to false immediately
  useEffect(() => {
    if (!user) {
      setLoading(false);
    }
  }, [user]);

  const hasRole = (role: string): boolean => {
    // Check both access tier and admin role
    return userTier === role || userAdminRole === role;
  };

  const isMasterAdmin = (): boolean => {
    return userAdminRole === 'super_admin';
  };

  const isAdmin = (): boolean => {
    return userAdminRole === 'admin' || userAdminRole === 'super_admin';
  };

  const getUserTier = (): string | null => {
    return userTier;
  };

  const getUserAdminRole = (): string | null => {
    return userAdminRole;
  };

  const canAccessSection = (sectionId: string): boolean => {
    // Core sections accessible to all authenticated users
    const coreSections = [
      'dashboard', 'search', 'my-account', 'how-to-use-portal', 'roleplay',
      'dashboard-search', 'dashboard-quick-actions', 'dashboard-user-stats', 
      'product-categories', 'dashboard-recently-viewed', 'dashboard-recommendations'
    ];

    // Require authentication
    if (!user) return false;

    if (coreSections.includes(sectionId)) return true;
    
    // Admins (admin and master_admin) can access everything
    if (isAdmin()) return true;
    
    // Check if this section is allowed for the user's tier
    return tierPermissions.some(
      p => p.access_type === 'section' && p.resource_id === sectionId
    );
  };

  const canAccessPage = (pageId: string): boolean => {
    // Core pages accessible to all authenticated users
    const corePages = ['dashboard', 'search', 'my-account', 'how-to-use-portal', 'search-by-profile', 'roleplay'];

    // Auth page should always be accessible to unauthenticated users
    if (pageId === 'auth') return true;

    // Require authentication for all other pages
    if (!user) return false;

    if (corePages.includes(pageId)) return true;
    
    // Admins (admin and master_admin) can access everything
    if (isAdmin()) return true;
    
    // Check if this page is allowed for the user's tier
    return tierPermissions.some(
      p => p.access_type === 'page' && p.resource_id === pageId
    );
  };

  const canEditSection = (sectionId: string): boolean => {
    // Only master admin can edit for now
    return isMasterAdmin();
  };

  const canEditPage = (pageId: string): boolean => {
    // Only master admin can edit for now
    return isMasterAdmin();
  };

  const canAccessTab = (tabId: string): boolean => {
    // For tabs, we'll use the same logic as pages for now
    return canAccessPage(tabId);
  };

  const canEditTab = (tabId: string): boolean => {
    return isMasterAdmin();
  };

  // Simplified permission getters that return basic permission objects
  const getSectionPermission = (sectionId: string) => {
    return {
      permission_type: canAccessSection(sectionId) ? 'view' : 'hidden',
      lock_message: !canAccessSection(sectionId) ? 'Access restricted for your tier level' : undefined
    };
  };

  const getPagePermission = (pageId: string) => {
    return {
      permission_type: canAccessPage(pageId) ? 'view' : 'hidden',
      lock_message: !canAccessPage(pageId) ? 'Access restricted for your tier level' : undefined
    };
  };

  const getTabPermission = (tabId: string) => {
    return {
      permission_type: canAccessTab(tabId) ? 'view' : 'hidden',
      lock_message: !canAccessTab(tabId) ? 'Access restricted for your tier level' : undefined
    };
  };

  const isSectionLocked = (sectionId: string): boolean => {
    return false; // No locked state in tier system, only hidden/visible
  };

  const isPageLocked = (pageId: string): boolean => {
    return false; // No locked state in tier system
  };

  const isTabLocked = (tabId: string): boolean => {
    return false; // No locked state in tier system
  };

  return {
    userTier,
    userAdminRole,
    tierPermissions,
    loading,
    hasRole,
    isMasterAdmin,
    isAdmin,
    getUserTier,
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