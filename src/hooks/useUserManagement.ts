import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UnifiedUser {
  id: string;
  email: string;
  status: 'pending_approval' | 'approved' | 'active' | 'suspended' | 'rejected';
  created_at: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  admin_role: string;
  access_tier: string;
  approval_request_id?: string;
  last_login?: string;
  can_login: boolean;
}

interface FilterState {
  search: string;
  status: string;
  role: string;
  sortBy: 'name' | 'email' | 'created_at' | 'status';
  sortOrder: 'asc' | 'desc';
}

export function useUserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UnifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    role: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const fetchAllUsers = async () => {
    try {
      // Get all approval requests
      const { data: approvalRequests, error: approvalsError } = await supabase
        .from('user_approval_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (approvalsError) throw approvalsError;

      // Get all profiles (active users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError && !profilesError.message.includes('permission')) {
        throw profilesError;
      }

      // Get user admin roles
      const { data: userAdminRoles, error: adminRolesError } = await supabase
        .from('user_admin_roles')
        .select('*');

      if (adminRolesError && !adminRolesError.message.includes('permission')) {
        throw adminRolesError;
      }

      // Get user access tiers
      const { data: userAccessTiers, error: tiersError } = await supabase
        .from('user_access_tiers')
        .select('*');

      if (tiersError && !tiersError.message.includes('permission')) {
        throw tiersError;
      }

      const unifiedUsers: UnifiedUser[] = [];

      // Process approval requests
      approvalRequests?.forEach(request => {
        const existingProfile = profiles?.find(p => p.email === request.email);
        const adminRole = userAdminRoles?.find(ur => ur.user_id === existingProfile?.user_id)?.admin_role || 'user';
        const accessTier = userAccessTiers?.find(ut => ut.user_id === existingProfile?.user_id)?.tier_level || 'level_1';
        
        let status: UnifiedUser['status'] = 'pending_approval';
        if (request.status === 'rejected') {
          status = 'rejected';
        } else if (request.status === 'suspended') {
          status = 'suspended';
        } else if (request.status === 'active' || request.status === 'approved') {
          status = existingProfile ? 'active' : 'approved';
        }

        unifiedUsers.push({
          id: existingProfile?.user_id || request.id,
          email: request.email,
          status,
          created_at: request.requested_at,
          profile: existingProfile ? {
            display_name: existingProfile.display_name,
            first_name: existingProfile.first_name || request.first_name,
            last_name: existingProfile.last_name || request.last_name,
            avatar_url: existingProfile.avatar_url,
          } : {
            display_name: null,
            first_name: request.first_name,
            last_name: request.last_name,
            avatar_url: null,
          },
          admin_role: adminRole,
          access_tier: accessTier,
          approval_request_id: request.id,
          can_login: existingProfile && adminRole !== 'user',
        });
      });

      // Process profiles without approval requests
      profiles?.forEach(profile => {
        const hasApprovalRequest = approvalRequests?.some(req => req.email === profile.email);
        if (!hasApprovalRequest) {
          const adminRole = userAdminRoles?.find(ur => ur.user_id === profile.user_id)?.admin_role || 'user';
          const accessTier = userAccessTiers?.find(ut => ut.user_id === profile.user_id)?.tier_level || 'level_1';
          
          unifiedUsers.push({
            id: profile.user_id,
            email: profile.email || 'No email',
            status: 'active',
            created_at: profile.created_at,
            profile: {
              display_name: profile.display_name,
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url,
            },
            admin_role: adminRole,
            access_tier: accessTier,
            can_login: adminRole !== 'user',
          });
        }
      });

      unifiedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setUsers(unifiedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Make sure you're logged in as an admin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const searchMatch = !filters.search || [
        user.email,
        user.profile?.display_name,
        user.profile?.first_name,
        user.profile?.last_name,
        user.admin_role,
        user.access_tier
      ].some(field => 
        field?.toLowerCase().includes(filters.search.toLowerCase())
      );
      
      const statusMatch = filters.status === "all" || user.status === filters.status;
      const roleMatch = filters.role === "all" || 
        (filters.role === "no_roles" && user.admin_role === 'user') ||
        user.admin_role === filters.role;
      
      return searchMatch && statusMatch && roleMatch;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = (a.profile?.display_name || `${a.profile?.first_name || ''} ${a.profile?.last_name || ''}`.trim() || a.email.split('@')[0]).toLowerCase();
          bValue = (b.profile?.display_name || `${b.profile?.first_name || ''} ${b.profile?.last_name || ''}`.trim() || b.email.split('@')[0]).toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [users, filters]);

  const getStatusCounts = () => {
    return {
      all: users.length,
      pending_approval: users.filter(u => u.status === 'pending_approval').length,
      approved: users.filter(u => u.status === 'approved').length,
      active: users.filter(u => u.status === 'active').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      rejected: users.filter(u => u.status === 'rejected').length,
    };
  };

  useEffect(() => {
    fetchAllUsers();
    
    const handleUserCreated = () => fetchAllUsers();
    window.addEventListener('userCreated', handleUserCreated);
    
    return () => window.removeEventListener('userCreated', handleUserCreated);
  }, []);

  return {
    users: filteredAndSortedUsers,
    loading,
    filters,
    setFilters,
    statusCounts: getStatusCounts(),
    refetch: fetchAllUsers
  };
}