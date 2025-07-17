import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCard } from "./UserCard";
import { RoleSelector } from "./RoleSelector";
import { PermissionMatrix } from "./PermissionMatrix";
import { Users, Search, UserPlus, Settings } from "lucide-react";

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);

  useEffect(() => {
    fetchUsers();
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
            <Button variant="outline" onClick={() => setShowPermissionMatrix(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Permissions
            </Button>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onRoleUpdate={handleUserRoleUpdate}
                onViewPermissions={(user) => {
                  setSelectedUser(user);
                  setShowPermissionMatrix(true);
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {showRoleSelector && selectedUser && (
        <RoleSelector
          user={selectedUser}
          onSave={(roles) => {
            handleUserRoleUpdate(selectedUser.id, roles);
            setShowRoleSelector(false);
            setSelectedUser(null);
          }}
          onCancel={() => {
            setShowRoleSelector(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showPermissionMatrix && (
        <PermissionMatrix
          user={selectedUser}
          onClose={() => {
            setShowPermissionMatrix(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}