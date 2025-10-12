import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCard } from "./UserCard";
import { TierConfigurationPanel } from "./TierConfigurationPanel";
import { Users, Search, Settings, Trash2, Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  roles: string[];
}

export function UserManagementSection() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTierConfiguration, setShowTierConfiguration] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
    
    // Listen for user creation events
    const handleUserCreated = () => {
      fetchUsers();
    };
    
    window.addEventListener('userCreated', handleUserCreated);
    
    return () => {
      window.removeEventListener('userCreated', handleUserCreated);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      // Get profiles (users with profiles)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError && profilesError.message.includes('permission')) {
        throw new Error('Access denied. Make sure you are logged in as a master admin.');
      }

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError && rolesError.message.includes('permission')) {
        throw new Error('Access denied. Make sure you are logged in as a master admin.');
      }

      // Transform the data
      const transformedUsers: User[] = profiles?.map(profile => {
        const roles = userRoles?.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role) || [];
        
        return {
          id: profile.user_id,
          email: profile.email || 'No email',
          created_at: profile.created_at,
          profile: {
            display_name: profile.display_name,
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
          },
          roles,
        };
      }) || [];

      setUsers(transformedUsers);

      if (transformedUsers.length === 0) {
        toast({
          title: "No Users Found",
          description: "No user profiles found in the system.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users. Make sure you're logged in as an admin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserRoleUpdate = async (userId: string, newRoles: string[]) => {
    try {
      // First, remove all existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then add the new roles
      if (newRoles.length > 0) {
        const roleInserts = newRoles.map(role => ({
          user_id: userId,
          role: role,
        }));

        await supabase
          .from('user_roles')
          .insert(roleInserts);
      }

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, roles: newRoles } : user
        )
      );

      toast({
        title: "Success",
        description: "User roles updated successfully",
      });
    } catch (error) {
      console.error('Error updating user roles:', error);
      toast({
        title: "Error",
        description: "Failed to update user roles",
        variant: "destructive",
      });
    }
  };

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

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      toast({
        title: "No users selected",
        description: "Please select users to delete",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedUsers.size} user(s)? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      // Use secure edge function to delete users from Auth and related tables
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('admin-delete-users', {
        body: { user_ids: Array.from(selectedUsers) },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error as any;

      const result = data as any;
      if (result.failed && result.failed.length > 0) {
        toast({
          title: "Partial delete",
          description: `Deleted ${result.deleted?.length || 0}, failed ${result.failed.length}.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Users deleted",
          description: `Successfully deleted ${selectedUsers.size} user(s)`,
        });
      }

      setSelectedUsers(new Set());
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        title: "Error",
        description: "Failed to delete users",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Users...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            User Management
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1 min-w-[150px] sm:min-w-[200px]">
              <Search className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 text-xs sm:text-sm h-9 sm:h-10 py-1 border-0"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTierConfiguration(true)}
              className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Configure Tiers</span>
              <span className="sm:hidden">Tiers</span>
            </Button>
            {selectedUsers.size > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-4"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                    <span className="hidden sm:inline">Deleting...</span>
                    <span className="sm:hidden">Del...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Delete {selectedUsers.size} user(s)</span>
                    <span className="sm:hidden">Del ({selectedUsers.size})</span>
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Select all ({filteredUsers.length})
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                Refresh
              </Button>
            </div>
            
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-start gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                  className="h-4 w-4 shrink-0 mt-3 sm:mt-[18px] cursor-pointer accent-primary"
                />
                <div className="flex-1">
                  <UserCard
                    user={user}
                    onRoleUpdate={handleUserRoleUpdate}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showTierConfiguration} onOpenChange={setShowTierConfiguration}>
        <TierConfigurationPanel
          open={showTierConfiguration}
          onOpenChange={setShowTierConfiguration}
        />
      </Dialog>
    </div>
  );
}