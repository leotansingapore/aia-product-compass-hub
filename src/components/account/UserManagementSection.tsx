import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
      // Delete user profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .in('user_id', Array.from(selectedUsers));

      if (profileError) throw profileError;

      // Delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .in('user_id', Array.from(selectedUsers));

      if (rolesError) throw rolesError;

      toast({
        title: "Users deleted",
        description: `Successfully deleted ${selectedUsers.size} user(s)`,
      });

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowTierConfiguration(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configure Tiers
            </Button>
            {selectedUsers.size > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {selectedUsers.size} user(s)
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  Select all ({filteredUsers.length} users)
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh Users
              </Button>
            </div>
            
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Checkbox
                  checked={selectedUsers.has(user.id)}
                  onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
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

      {showTierConfiguration && (
        <TierConfigurationPanel
          onClose={() => setShowTierConfiguration(false)}
        />
      )}
    </div>
  );
}