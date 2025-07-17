import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, Lock, Unlock, Eye, EyeOff, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email?: string;
  created_at: string;
  roles?: string[];
}

interface Section {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermission {
  user_id: string;
  section_id: string;
  permission_type: string;
  lock_message?: string;
}

export default function AdminDashboard() {
  const { isMasterAdmin } = usePermissions();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<string>('view');
  const [lockMessage, setLockMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMasterAdmin()) {
      fetchData();
    }
  }, [isMasterAdmin]);

  const fetchData = async () => {
    try {
      // Fetch users (would need a view or function in production)
      const { data: userData } = await supabase.auth.admin.listUsers();
      
      // Fetch sections
      const { data: sectionsData } = await supabase
        .from('app_sections')
        .select('*')
        .order('category', { ascending: true });

      // Fetch permissions
      const { data: permissionsData } = await supabase
        .from('user_section_permissions')
        .select('*');

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Combine user data with roles
      const usersWithRoles = userData?.users?.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        roles: rolesData?.filter(r => r.user_id === user.id).map(r => r.role) || []
      })) || [];

      setUsers(usersWithRoles);
      setSections(sectionsData || []);
      setPermissions(permissionsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const updateSectionPermission = async () => {
    if (!selectedUser || !selectedSection) return;

    try {
      const { error } = await supabase
        .from('user_section_permissions')
        .upsert({
          user_id: selectedUser,
          section_id: selectedSection,
          permission_type: selectedPermission,
          lock_message: lockMessage || null
        }, { onConflict: 'user_id,section_id' });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Section permission updated successfully",
      });
      
      // Reset form
      setSelectedUser('');
      setSelectedSection('');
      setSelectedPermission('view');
      setLockMessage('');
      
      fetchData();
    } catch (error) {
      console.error('Error updating section permission:', error);
      toast({
        title: "Error",
        description: "Failed to update section permission",
        variant: "destructive",
      });
    }
  };

  const getPermissionIcon = (permissionType: string) => {
    switch (permissionType) {
      case 'hidden': return <EyeOff className="h-4 w-4" />;
      case 'locked': return <Lock className="h-4 w-4" />;
      case 'read_only': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      default: return <Unlock className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (permissionType: string) => {
    switch (permissionType) {
      case 'hidden': return 'destructive';
      case 'locked': return 'secondary';
      case 'read_only': return 'outline';
      case 'edit': return 'default';
      default: return 'default';
    }
  };

  if (!isMasterAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need master administrator privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Master Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="permissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="permissions">Section Permissions</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="sections">Section Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Section Permissions</CardTitle>
                <CardDescription>
                  Control what sections users can access and how they can interact with them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select User</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email} ({user.roles?.join(', ') || 'user'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Section</label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map(section => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name} ({section.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Permission Type</label>
                    <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View (Full Access)</SelectItem>
                        <SelectItem value="read_only">Read Only</SelectItem>
                        <SelectItem value="locked">Locked (Show Message)</SelectItem>
                        <SelectItem value="hidden">Hidden (Completely Hidden)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPermission === 'locked' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Lock Message</label>
                      <Input
                        value={lockMessage}
                        onChange={(e) => setLockMessage(e.target.value)}
                        placeholder="Enter custom lock message..."
                      />
                    </div>
                  )}
                </div>

                <Button 
                  onClick={updateSectionPermission}
                  disabled={!selectedUser || !selectedSection}
                >
                  Update Permission
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Permission</TableHead>
                      <TableHead>Lock Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission, index) => {
                      const user = users.find(u => u.id === permission.user_id);
                      const section = sections.find(s => s.id === permission.section_id);
                      return (
                        <TableRow key={index}>
                          <TableCell>{user?.email || 'Unknown'}</TableCell>
                          <TableCell>{section?.name || permission.section_id}</TableCell>
                          <TableCell>
                            <Badge variant={getPermissionColor(permission.permission_type)} className="flex items-center gap-1 w-fit">
                              {getPermissionIcon(permission.permission_type)}
                              {permission.permission_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {permission.lock_message || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user roles and access levels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Roles</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.roles?.map(role => (
                              <Badge key={role} variant="outline">{role}</Badge>
                            )) || <Badge variant="outline">user</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => updateUserRole(user.id, 'admin')}>
                              Make Admin
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateUserRole(user.id, 'user')}>
                              Make User
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map(section => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">{section.category}</Badge>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Section ID: {section.id}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}