import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePermissions() {
  const { user } = useAuth();
  const [userTier, setUserTier] = useState<string | null>(null);
  const [tierPermissions, setTierPermissions] = useState<{ access_type: string; resource_id: string; }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    } else {
      setUserTier(null);
      setTierPermissions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    if (!user) return;

    try {
      console.log('🔧 Fetching tier permissions for user:', user.id);
      
      // Get user's tier using the database function
      const { data: tierData, error: tierError } = await supabase.rpc('get_user_tier', {
        user_id: user.id
      });

      if (tierError) {
        console.error('🔧 Error fetching user tier:', tierError);
        setUserTier(null);
      } else {
        setUserTier(tierData || null);
        console.log('🔧 User tier:', tierData);
      }

      // Fetch tier permissions if user has a tier
      if (tierData) {
        const { data: permissions, error: permissionsError } = await supabase
          .from('tier_permissions')
          .select('access_type, resource_id')
          .eq('tier_level', tierData);

        if (permissionsError) {
          console.error('🔧 Error fetching tier permissions:', permissionsError);
        } else {
          setTierPermissions(permissions || []);
          console.log('🔧 Loaded tier permissions:', permissions);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return userTier === role;
  };

  const isMasterAdmin = (): boolean => {
    return userTier === 'master_admin';
  };

  const getUserTier = (): string | null => {
    return userTier;
  };

  const canAccessSection = (sectionId: string): boolean => {
    // Core sections accessible to all authenticated users
    const coreSections = [
      'dashboard', 'search', 'my-account', 'how-to-use-portal',
      'dashboard-search', 'dashboard-quick-actions', 'dashboard-user-stats', 
      'product-categories', 'dashboard-recently-viewed', 'dashboard-recommendations'
    ];
    if (coreSections.includes(sectionId)) return true;
    
    // Master admin can access everything
    if (isMasterAdmin()) return true;
    
    // Check if this section is allowed for the user's tier
    return tierPermissions.some(
      p => p.access_type === 'section' && p.resource_id === sectionId
    );
  };

  const canAccessPage = (pageId: string): boolean => {
    // Core pages accessible to all authenticated users
    const corePages = ['dashboard', 'search', 'my-account'];
    if (corePages.includes(pageId)) return true;
    
    // Master admin can access everything
    if (isMasterAdmin()) return true;
    
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

  const isSectionReadOnly = (sectionId: string): boolean => {
    return !canEditSection(sectionId) && canAccessSection(sectionId);
  };

  const isPageLocked = (pageId: string): boolean => {
    return false; // No locked state in tier system
  };

  const isPageReadOnly = (pageId: string): boolean => {
    return !canEditPage(pageId) && canAccessPage(pageId);
  };

  const isTabLocked = (tabId: string): boolean => {
    return false; // No locked state in tier system
  };

  const isTabReadOnly = (tabId: string): boolean => {
    return !canEditTab(tabId) && canAccessTab(tabId);
  };

  return {
    userTier,
    tierPermissions,
    loading,
    hasRole,
    isMasterAdmin,
    getUserTier,
    // Section permissions
    getSectionPermission,
    canAccessSection,
    canEditSection,
    isSectionLocked,
    isSectionReadOnly,
    // Page permissions
    getPagePermission,
    canAccessPage,
    canEditPage,
    isPageLocked,
    isPageReadOnly,
    // Tab permissions
    getTabPermission,
    canAccessTab,
    canEditTab,
    isTabLocked,
    isTabReadOnly,
    refetch: fetchUserPermissions
  };
}