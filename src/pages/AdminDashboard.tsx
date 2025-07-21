import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Settings, Lock, Unlock, Eye, EyeOff, Edit, RefreshCw, CheckCircle, AlertCircle, UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { UserInterfacePreview } from '@/components/admin/UserInterfacePreview';
import { useAppSectionSync } from '@/hooks/useAppSectionSync';

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

interface ApprovalRequest {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  notes?: string;
}

export default function AdminDashboard() {
  const { isMasterAdmin } = usePermissions();
  const { toast } = useToast();
  const { syncing, lastSyncResult, syncSections, autoSync } = useAppSectionSync();
  const [users, setUsers] = useState<User[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<string>('view');
  const [lockMessage, setLockMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMasterAdmin()) {
      fetchData();
      // Auto-sync only runs once per session to prevent resource exhaustion
      setTimeout(() => autoSync(), 2000);
    }
  }, [isMasterAdmin]);

  const fetchData = async () => {
    try {
      // Fetch users from profiles table (accessible to master admins)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        throw profilesError;
      }
      
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('app_sections')
        .select('*')
        .order('category', { ascending: true });

      if (sectionsError) {
        throw sectionsError;
      }

      // Fetch permissions
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('user_section_permissions')
        .select('*');

      if (permissionsError) {
        throw permissionsError;
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        throw rolesError;
      }

      // Fetch approval requests
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('user_approval_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (approvalsError) {
        console.error('Error fetching approval requests:', approvalsError);
        // Don't fail the whole operation for approvals
      }

      // Transform profiles data to match User interface
      const usersWithRoles = profilesData?.map(profile => ({
        id: profile.user_id,
        email: profile.email || 'No email',
        created_at: profile.created_at,
        roles: rolesData?.filter(r => r.user_id === profile.user_id).map(r => r.role) || []
      })) || [];

      setUsers(usersWithRoles);
      setSections(sectionsData || []);
      setPermissions(permissionsData || []);
      setApprovalRequests((approvalsData || []).map(request => ({
        ...request,
        status: request.status as 'pending' | 'approved' | 'rejected'
      })));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data. Make sure you're logged in as a master admin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    try {
      const result = await syncSections();
      toast({
        title: "Sync Complete",
        description: `Added: ${result.added}, Updated: ${result.updated}${result.errors.length > 0 ? ` (${result.errors.length} warnings)` : ''}`,
      });
      // Refresh data after sync
      fetchData();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync app sections",
        variant: "destructive",
      });
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

  const handleApprovalAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      if (action === 'approve') {
        // Call the approval function
        const { error } = await supabase.rpc('approve_user_request', {
          request_id: requestId
        });

        if (error) throw error;

        toast({
          title: "Request Approved",
          description: "User account has been created successfully",
        });
      } else {
        // Reject the request
        const { error } = await supabase
          .from('user_approval_requests')
          .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: (await supabase.auth.getUser()).data.user?.id,
            notes: notes || 'Request rejected'
          })
          .eq('id', requestId);

        if (error) throw error;

        toast({
          title: "Request Rejected",
          description: "The approval request has been rejected",
        });
      }

      // Refresh data
      fetchData();
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
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

        <Tabs defaultValue="preview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="preview">User Preview & Controls</TabsTrigger>
            <TabsTrigger value="approvals" className="relative">
              User Approvals
              {approvalRequests.filter(r => r.status === 'pending').length > 0 && (
                <Badge className="ml-1 text-xs" variant="destructive">
                  {approvalRequests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="permissions">Section Permissions</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="sections">Section Overview</TabsTrigger>
            <TabsTrigger value="sync">Auto Sync</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select User to Preview</CardTitle>
                <CardDescription>
                  Choose a user to preview their interface and manage their section permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md">
                  <label className="text-sm font-medium mb-2 block">Select User</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user to preview" />
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
              </CardContent>
            </Card>

            <UserInterfacePreview
              selectedUser={selectedUser ? users.find(u => u.id === selectedUser) || null : null}
              sections={sections}
              permissions={permissions}
              onPermissionUpdate={fetchData}
            />
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  User Approval Requests
                </CardTitle>
                <CardDescription>
                  Review and approve new user registration requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvalRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No approval requests found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Details</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvalRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.email}</div>
                              {(request.first_name || request.last_name) && (
                                <div className="text-sm text-muted-foreground">
                                  {request.first_name} {request.last_name}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {request.company || '-'}
                          </TableCell>
                          <TableCell className="text-sm max-w-xs">
                            {request.reason || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                request.status === 'approved' ? 'default' :
                                request.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }
                              className="flex items-center gap-1 w-fit"
                            >
                              {request.status === 'approved' && <UserCheck className="h-3 w-3" />}
                              {request.status === 'rejected' && <UserX className="h-3 w-3" />}
                              {request.status === 'pending' && <Clock className="h-3 w-3" />}
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(request.requested_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApprovalAction(request.id, 'approve')}
                                  className="text-xs"
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleApprovalAction(request.id, 'reject', 'Manually rejected by admin')}
                                  className="text-xs"
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {request.status === 'approved' ? 'Account created' : 'Request rejected'}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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

          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  App Section Sync
                </CardTitle>
                <CardDescription>
                  Automatically synchronize app sections from code to database. This ensures that when you add or remove sections in the APP_STRUCTURE, the database stays in sync.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={handleManualSync} 
                    disabled={syncing}
                    className="flex items-center gap-2"
                  >
                    {syncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Sync Now
                      </>
                    )}
                  </Button>
                  
                  {lastSyncResult && (
                    <Badge variant={lastSyncResult.errors.length > 0 ? "destructive" : "default"} className="flex items-center gap-1">
                      {lastSyncResult.errors.length > 0 ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      Last sync: +{lastSyncResult.added} -{lastSyncResult.updated} 
                      {lastSyncResult.errors.length > 0 && ` (${lastSyncResult.errors.length} warnings)`}
                    </Badge>
                  )}
                </div>

                {lastSyncResult && lastSyncResult.errors.length > 0 && (
                  <Card className="bg-destructive/10 border-destructive/20">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Sync Warnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        {lastSyncResult.errors.map((error, index) => (
                          <li key={index} className="text-destructive">• {error}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How Auto-Sync Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• <strong>Automatic:</strong> Runs when the admin panel loads</p>
                    <p>• <strong>Safe:</strong> Only adds/updates sections, never deletes</p>
                    <p>• <strong>Smart:</strong> Detects changes in names, descriptions, and categories</p>
                    <p>• <strong>Preserves:</strong> All existing permissions are maintained</p>
                    <p>• <strong>Logs:</strong> Shows detailed sync results and warnings</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}