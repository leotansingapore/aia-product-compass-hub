import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Plus, RefreshCw, Filter } from "lucide-react";
import { UserDirectoryRow } from "./UserDirectoryRow";
import { CreateUserForm } from "./CreateUserForm";
import { BulkUserActions } from "./BulkUserActions";

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

export function UnifiedUserDirectory() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UnifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);

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

      // Get all user roles
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
        const userRolesForUser = userRoles?.filter(ur => ur.user_id === existingProfile?.user_id) || [];
        
        let status: UnifiedUser['status'] = 'pending_approval';
        if (request.status === 'rejected') {
          status = 'rejected';
        } else if (request.status === 'approved') {
          if (existingProfile) {
            if (userRolesForUser.length === 0) {
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
          roles: userRolesForUser.map(ur => ur.role),
          approval_request_id: request.id,
          can_login: existingProfile && userRolesForUser.length > 0,
        });
      });

      // Process profiles that don't have approval requests (manually created users)
      profiles?.forEach(profile => {
        const hasApprovalRequest = approvalRequests?.some(req => req.email === profile.email);
        if (!hasApprovalRequest) {
          const userRolesForUser = userRoles?.filter(ur => ur.user_id === profile.user_id) || [];
          
          unifiedUsers.push({
            id: profile.user_id,
            email: profile.email || 'No email',
            status: userRolesForUser.length > 0 ? 'active' : 'needs_role',
            created_at: profile.created_at,
            profile: {
              display_name: profile.display_name,
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url,
            },
            roles: userRolesForUser.map(ur => ur.role),
            can_login: userRolesForUser.length > 0,
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
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
      <Card>
        <CardHeader>
          <CardTitle>Loading User Directory...</CardTitle>
        </CardHeader>
      </Card>
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
          {/* Search and Filter Bar */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                <SelectItem value="pending_approval">
                  Pending Approval ({statusCounts.pending_approval})
                </SelectItem>
                <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
                <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
                <SelectItem value="needs_role">Needs Role ({statusCounts.needs_role})</SelectItem>
                <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchAllUsers} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">{statusCounts.pending_approval}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">{statusCounts.approved}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-green-600">{statusCounts.active}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-amber-600">{statusCounts.needs_role}</div>
              <div className="text-xs text-muted-foreground">Needs Role</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-gray-600">{statusCounts.suspended}</div>
              <div className="text-xs text-muted-foreground">Suspended</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-red-600">{statusCounts.rejected}</div>
              <div className="text-xs text-muted-foreground">Rejected</div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <BulkUserActions
              selectedUserIds={Array.from(selectedUsers)}
              selectedUsers={filteredUsers.filter(u => selectedUsers.has(u.id))}
              onActionComplete={() => {
                setSelectedUsers(new Set());
                fetchAllUsers();
              }}
            />
          )}

          {/* User List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all ({filteredUsers.length} users)
                  </span>
                </div>
                
                {filteredUsers.map((user) => (
                  <UserDirectoryRow
                    key={user.id}
                    user={user}
                    isSelected={selectedUsers.has(user.id)}
                    onSelect={(checked) => handleUserSelect(user.id, checked)}
                    onUpdate={fetchAllUsers}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}