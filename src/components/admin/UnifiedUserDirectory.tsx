import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Loader2 } from "lucide-react";
import { CreateUserForm } from "./CreateUserForm";
import { BulkUserActions } from "./BulkUserActions";
import { UserManagementTable } from "./UserManagementTable";
import { EnhancedUserFilters } from "./EnhancedUserFilters";

export interface UnifiedUser {
  id: string;
  email: string;
  status: 'pending_approval' | 'approved' | 'active' | 'needs_role' | 'suspended' | 'rejected';
  created_at: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  roles: string[];
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

export function UnifiedUserDirectory() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UnifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    role: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchAllUsers();
    
    // Listen for user creation events
    const handleUserCreated = () => {
      fetchAllUsers();
    };
    
    window.addEventListener('userCreated', handleUserCreated);
    
    return () => {
      window.removeEventListener('userCreated', handleUserCreated);
    };
  }, []);

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

      // Get all user access tiers
      const { data: userTiers, error: tiersError } = await supabase
        .from('user_access_tiers')
        .select('*');

      // Get all user admin roles
      const { data: userAdminRoles, error: adminRolesError } = await supabase
        .from('user_admin_roles')
        .select('*');

      // Get legacy user roles for backward compatibility
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError && !rolesError.message.includes('permission')) {
        throw rolesError;
      }

      const unifiedUsers: UnifiedUser[] = [];

      // Process approval requests (pending, approved, rejected)
      approvalRequests?.forEach(request => {
        const existingProfile = profiles?.find(p => p.email === request.email);
        const userTierForUser = userTiers?.find(ut => ut.user_id === existingProfile?.user_id);
        const userAdminRolesForUser = userAdminRoles?.filter(ur => ur.user_id === existingProfile?.user_id) || [];
        const legacyRolesForUser = userRoles?.filter(ur => ur.user_id === existingProfile?.user_id) || [];
        
        // Combine all roles for display
        const allRoles = [
          ...(userTierForUser ? [userTierForUser.tier_level] : []),
          ...userAdminRolesForUser.map(r => r.admin_role),
          ...legacyRolesForUser.map(r => r.role)
        ];
        
        let status: UnifiedUser['status'] = 'pending_approval';
        if (request.status === 'rejected') {
          status = 'rejected';
        } else if (request.status === 'suspended') {
          status = 'suspended';
        } else if (request.status === 'active' || request.status === 'approved') {
          if (existingProfile) {
            if (allRoles.length === 0) {
              status = 'needs_role';
            } else {
              status = 'active';
            }
          } else {
            status = 'approved';
          }
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
          roles: allRoles,
          approval_request_id: request.id,
          can_login: existingProfile && allRoles.length > 0,
        });
      });

      // Process profiles that don't have approval requests (manually created users)
      profiles?.forEach(profile => {
        const hasApprovalRequest = approvalRequests?.some(req => req.email === profile.email);
        if (!hasApprovalRequest) {
          const userTierForUser = userTiers?.find(ut => ut.user_id === profile.user_id);
          const userAdminRolesForUser = userAdminRoles?.filter(ur => ur.user_id === profile.user_id) || [];
          const legacyRolesForUser = userRoles?.filter(ur => ur.user_id === profile.user_id) || [];
          
          // Combine all roles for display
          const allRoles = [
            ...(userTierForUser ? [userTierForUser.tier_level] : []),
            ...userAdminRolesForUser.map(r => r.admin_role),
            ...legacyRolesForUser.map(r => r.role)
          ];
          
          unifiedUsers.push({
            id: profile.user_id,
            email: profile.email || 'No email',
            status: allRoles.length > 0 ? 'active' : 'needs_role',
            created_at: profile.created_at,
            profile: {
              display_name: profile.display_name,
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url,
            },
            roles: allRoles,
            can_login: allRoles.length > 0,
          });
        }
      });

      // Sort by created_at descending
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
      // Search filter
      const searchMatch = !filters.search || [
        user.email,
        user.profile?.display_name,
        user.profile?.first_name,
        user.profile?.last_name,
        ...user.roles
      ].some(field => 
        field?.toLowerCase().includes(filters.search.toLowerCase())
      );
      
      // Status filter
      const statusMatch = filters.status === "all" || user.status === filters.status;
      
      // Role filter
      const roleMatch = filters.role === "all" || 
        (filters.role === "no_roles" && user.roles.length === 0) ||
        user.roles.includes(filters.role);
      
      return searchMatch && statusMatch && roleMatch;
    });

    // Sort users
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

  const handleUserSelect = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers);
    if (checked) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredAndSortedUsers.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const getStatusCounts = () => {
    return {
      all: users.length,
      pending_approval: users.filter(u => u.status === 'pending_approval').length,
      approved: users.filter(u => u.status === 'approved').length,
      active: users.filter(u => u.status === 'active').length,
      needs_role: users.filter(u => u.status === 'needs_role').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      rejected: users.filter(u => u.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Directory</h2>
          <p className="text-muted-foreground">
            Manage all users from registration to activation in one place
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {showCreateForm && (
        <CreateUserForm />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({users.length})
          </CardTitle>
          <CardDescription>
            Complete user lifecycle management from registration to activation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Enhanced Filters */}
          <EnhancedUserFilters
            filters={filters}
            statusCounts={statusCounts}
            onFiltersChange={setFilters}
            onRefresh={fetchAllUsers}
          />

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="mb-6">
              <BulkUserActions
                selectedUserIds={Array.from(selectedUsers)}
                selectedUsers={filteredAndSortedUsers.filter(u => selectedUsers.has(u.id))}
                onActionComplete={() => {
                  setSelectedUsers(new Set());
                  fetchAllUsers();
                }}
              />
            </div>
          )}

          {/* User Table */}
          {filteredAndSortedUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium mb-2">No users found</p>
              <p className="text-sm">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <UserManagementTable
              users={filteredAndSortedUsers}
              selectedUsers={selectedUsers}
              onUserSelect={handleUserSelect}
              onSelectAll={handleSelectAll}
              onUpdate={fetchAllUsers}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}