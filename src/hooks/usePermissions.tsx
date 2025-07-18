import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PermissionType = 'hidden' | 'locked' | 'read_only' | 'view' | 'edit';

export interface SectionPermission {
  permission_type: PermissionType;
  lock_message?: string;
}

export function usePermissions() {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [sectionPermissions, setSectionPermissions] = useState<Record<string, SectionPermission>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    } else {
      setUserRoles([]);
      setSectionPermissions({});
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

  return {
    userRoles,
    sectionPermissions,
    loading,
    hasRole,
    isMasterAdmin,
    getSectionPermission,
    canAccessSection,
    canEditSection,
    isSectionLocked,
    isSectionReadOnly,
    refetch: fetchUserPermissions
  };
}