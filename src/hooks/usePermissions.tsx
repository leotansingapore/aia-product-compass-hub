import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PermissionType = 'hidden' | 'locked' | 'read_only' | 'view' | 'edit';

export interface SectionPermission {
  permission_type: PermissionType;
  lock_message?: string;
}

export interface PagePermission {
  permission_type: PermissionType;
  lock_message?: string;
}

export interface TabPermission {
  permission_type: PermissionType;
  lock_message?: string;
}

export function usePermissions() {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [sectionPermissions, setSectionPermissions] = useState<Record<string, SectionPermission>>({});
  const [pagePermissions, setPagePermissions] = useState<Record<string, PagePermission>>({});
  const [tabPermissions, setTabPermissions] = useState<Record<string, TabPermission>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    } else {
      setUserRoles([]);
      setSectionPermissions({});
      setPagePermissions({});
      setTabPermissions({});
      setLoading(false);
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    if (!user) return;

    try {
      console.log('🔧 Fetching permissions for user:', user.id);
      
      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('🔧 Error fetching roles:', rolesError);
      }

      const userRolesList = roles?.map(r => r.role) || ['user'];
      setUserRoles(userRolesList);
      console.log('🔧 User roles:', userRolesList);

      // Fetch section permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('user_section_permissions')
        .select('section_id, permission_type, lock_message')
        .eq('user_id', user.id);

      if (permissionsError) {
        console.error('🔧 Error fetching permissions:', permissionsError);
      }

      const permissionsMap: Record<string, SectionPermission> = {};
      permissions?.forEach(p => {
        permissionsMap[p.section_id] = {
          permission_type: p.permission_type as PermissionType,
          lock_message: p.lock_message
        };
      });

      setSectionPermissions(permissionsMap);
      console.log('🔧 Loaded section permissions:', permissionsMap);

      // Fetch page permissions
      const { data: pagePerms, error: pagePermsError } = await supabase
        .from('user_page_permissions')
        .select('page_id, permission_type, lock_message')
        .eq('user_id', user.id);

      if (pagePermsError) {
        console.error('🔧 Error fetching page permissions:', pagePermsError);
      }

      const pagePermissionsMap: Record<string, PagePermission> = {};
      pagePerms?.forEach(p => {
        pagePermissionsMap[p.page_id] = {
          permission_type: p.permission_type as PermissionType,
          lock_message: p.lock_message
        };
      });

      setPagePermissions(pagePermissionsMap);
      console.log('🔧 Loaded page permissions:', pagePermissionsMap);

      // Fetch tab permissions
      const { data: tabPerms, error: tabPermsError } = await supabase
        .from('user_tab_permissions')
        .select('tab_id, permission_type, lock_message')
        .eq('user_id', user.id);

      if (tabPermsError) {
        console.error('🔧 Error fetching tab permissions:', tabPermsError);
      }

      const tabPermissionsMap: Record<string, TabPermission> = {};
      tabPerms?.forEach(p => {
        tabPermissionsMap[p.tab_id] = {
          permission_type: p.permission_type as PermissionType,
          lock_message: p.lock_message
        };
      });

      setTabPermissions(tabPermissionsMap);
      console.log('🔧 Loaded tab permissions:', tabPermissionsMap);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const isMasterAdmin = (): boolean => {
    return hasRole('master_admin');
  };

  const getSectionPermission = (sectionId: string): SectionPermission => {
    // Check for direct permission first
    let permission = sectionPermissions[sectionId];
    
    // If no direct permission and this is an individual category, check parent permission
    if (!permission && sectionId.startsWith('product-category-')) {
      const parentPermission = sectionPermissions['product-categories'];
      if (parentPermission && parentPermission.permission_type === 'hidden') {
        permission = { permission_type: 'hidden', lock_message: 'Category access restricted' };
      }
    }
    
    // Default to view if no permission found
    return permission || { permission_type: 'view' };
  };

  const canAccessSection = (sectionId: string): boolean => {
    const permission = getSectionPermission(sectionId);
    return permission.permission_type !== 'hidden';
  };

  const canEditSection = (sectionId: string): boolean => {
    const permission = getSectionPermission(sectionId);
    return permission.permission_type === 'edit' || permission.permission_type === 'view';
  };

  const isSectionLocked = (sectionId: string): boolean => {
    const permission = getSectionPermission(sectionId);
    return permission.permission_type === 'locked';
  };

  const isSectionReadOnly = (sectionId: string): boolean => {
    const permission = getSectionPermission(sectionId);
    return permission.permission_type === 'read_only';
  };

  // Page permission methods
  const getPagePermission = (pageId: string): PagePermission => {
    return pagePermissions[pageId] || { permission_type: 'view' };
  };

  const canAccessPage = (pageId: string): boolean => {
    const permission = getPagePermission(pageId);
    return permission.permission_type !== 'hidden';
  };

  const canEditPage = (pageId: string): boolean => {
    const permission = getPagePermission(pageId);
    return permission.permission_type === 'edit' || permission.permission_type === 'view';
  };

  const isPageLocked = (pageId: string): boolean => {
    const permission = getPagePermission(pageId);
    return permission.permission_type === 'locked';
  };

  const isPageReadOnly = (pageId: string): boolean => {
    const permission = getPagePermission(pageId);
    return permission.permission_type === 'read_only';
  };

  // Tab permission methods
  const getTabPermission = (tabId: string): TabPermission => {
    return tabPermissions[tabId] || { permission_type: 'view' };
  };

  const canAccessTab = (tabId: string): boolean => {
    const permission = getTabPermission(tabId);
    return permission.permission_type !== 'hidden';
  };

  const canEditTab = (tabId: string): boolean => {
    const permission = getTabPermission(tabId);
    return permission.permission_type === 'edit' || permission.permission_type === 'view';
  };

  const isTabLocked = (tabId: string): boolean => {
    const permission = getTabPermission(tabId);
    return permission.permission_type === 'locked';
  };

  const isTabReadOnly = (tabId: string): boolean => {
    const permission = getTabPermission(tabId);
    return permission.permission_type === 'read_only';
  };

  return {
    userRoles,
    sectionPermissions,
    pagePermissions,
    tabPermissions,
    loading,
    hasRole,
    isMasterAdmin,
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