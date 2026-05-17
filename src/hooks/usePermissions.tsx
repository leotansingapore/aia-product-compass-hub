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

// In-flight dedupe — when several components mount in the same tick, share one RPC.
// `hasInitialized.current` is per-instance, so without this, 3-4 simultaneous
// `usePermissions()` callers each fire `get_user_admin_role` before the cache populates.
const inflightAdminRole = new Map<string, Promise<string>>();

async function fetchAdminRoleDeduped(userId: string): Promise<string> {
  const cached = permissionsCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION && cached.version === PERMISSIONS_VERSION) {
    return cached.adminRole;
  }
  const inflight = inflightAdminRole.get(userId);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_admin_role', { user_id: userId });
      if (error) {
        console.error('Error fetching user admin role:', error);
        return 'user';
      }
      const role = (data as string | null) || 'user';
      permissionsCache.set(userId, {
        adminRole: role,
        timestamp: Date.now(),
        version: PERMISSIONS_VERSION,
      });
      return role;
    } finally {
      inflightAdminRole.delete(userId);
    }
  })();
  inflightAdminRole.set(userId, promise);
  return promise;
}

// Export function to manually clear permissions cache
export const clearPermissionsCache = (userId?: string) => {
  if (userId) {
    permissionsCache.delete(userId);
    inflightAdminRole.delete(userId);
    console.log('[Permissions] Cache cleared for user:', userId);
  } else {
    permissionsCache.clear();
    inflightAdminRole.clear();
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
  const { user, loading: authLoading } = useSimplifiedAuthSafe();
  const [userAdminRole, setUserAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  const fetchUserPermissions = useCallback(async () => {
    if (!user || hasInitialized.current) return;

    hasInitialized.current = true;

    // Clear stale cache if version mismatch
    const cached = permissionsCache.get(user.id);
    if (cached && cached.version !== PERMISSIONS_VERSION) {
      permissionsCache.delete(user.id);
    }

    setLoading(true);
    try {
      const role = await fetchAdminRoleDeduped(user.id);
      setUserAdminRole(role);
    } catch (error) {
      console.error('Error in fetchUserPermissions:', error);
      setUserAdminRole('user');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !hasInitialized.current) {
      fetchUserPermissions();
    } else if (!user) {
      // Reset state when user logs out — but ONLY if auth has finished
      // resolving. Otherwise this fires on the initial null-user state
      // before Supabase has restored the session, flipping loading=false
      // mid-bootstrap. Downstream callers (AdminViewSwitcher) then see
      // "loaded but not admin" and stomp persisted state like
      // `view-as-tier` in localStorage. Match the gating used by the
      // sibling effect below.
      if (authLoading) return;
      setUserAdminRole(null);
      setLoading(false);
      hasInitialized.current = false;
    }
  }, [user, authLoading, fetchUserPermissions]);

  // Silent role refresh on tab return — but at most once per 5 min. Without a
  // cooldown, admins switching between dev tools / Slack / browser tabs fire
  // a Supabase RPC on every visibility flip, which adds latency and (when
  // the role *does* differ from cached) triggers a context re-render that
  // cascades through AdminProvider into every downstream consumer.
  const lastSilentRefreshRef = useRef<number>(0);
  const SILENT_REFRESH_COOLDOWN_MS = 5 * 60 * 1000;
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible' || !user) return;
      // Avoid focus-time role refresh while watching videos to prevent unnecessary player-side interruptions.
      const path = window.location.pathname;
      if (path.includes('/video/')) return;
      const now = Date.now();
      if (now - lastSilentRefreshRef.current < SILENT_REFRESH_COOLDOWN_MS) return;
      lastSilentRefreshRef.current = now;

      try {
        const { data: newRole } = await supabase.rpc('get_user_admin_role', { user_id: user.id });
        const roleValue = newRole || 'user';
        if (roleValue !== userAdminRole) {
          setUserAdminRole(roleValue);
          permissionsCache.set(user.id, {
            adminRole: roleValue,
            timestamp: Date.now(),
            version: PERMISSIONS_VERSION,
          });
        }
      } catch (error) {
        console.warn('[Permissions] Silent refresh failed:', error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, userAdminRole]);

  // If no user AND auth has finished resolving, set loading to false.
  // Previously this fired the moment `user === null` regardless of auth
  // state — so during the initial page-load gap (auth still resolving the
  // existing Supabase session) callers briefly saw `loading=false` with
  // `user=null`, which let AdminViewSwitcher decide the user wasn't admin
  // and wipe a persisted `view-as-tier` from localStorage before the
  // session ever resolved. Gating on `authLoading=false` collapses that
  // window: while auth is still loading we keep saying "still checking".
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
    }
  }, [user, authLoading]);

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
