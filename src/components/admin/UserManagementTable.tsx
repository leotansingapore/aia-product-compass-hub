import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { 
  UserCheck, 
  UserX, 
  Mail, 
  Key, 
  Settings, 
  Trash2, 
  AlertTriangle,
  Shield,
  User,
  Award,
  Star,
  MoreHorizontal,
  ExternalLink,
  Loader2,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UnifiedUser } from "./UnifiedUserDirectory";
import { PasswordResetDialog } from "./PasswordResetDialog";
import { ProvisionUserDialog } from "./ProvisionUserDialog";
import { SendEmailDialog } from "./SendEmailDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RoleSelector } from "@/components/account/RoleSelector";

interface UserManagementTableProps {
  users: UnifiedUser[];
  selectedUsers: Set<string>;
  onUserSelect: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdate: () => void;
}

export function UserManagementTable({ 
  users, 
  selectedUsers, 
  onUserSelect, 
  onSelectAll, 
  onUpdate 
}: UserManagementTableProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<{ [key: string]: string | null }>({});
  const [passwordResetUser, setPasswordResetUser] = useState<UnifiedUser | null>(null);
  const [provisionUser, setProvisionUser] = useState<UnifiedUser | null>(null);
  const [sendEmailUser, setSendEmailUser] = useState<UnifiedUser | null>(null);
  const [manageRolesUser, setManageRolesUser] = useState<UnifiedUser | null>(null);

  const setUserLoading = (userId: string, type: string | null) => {
    setLoading(prev => ({ ...prev, [userId]: type }));
  };

  const getUserLoading = (userId: string) => loading[userId] || null;

  const getStatusConfig = (status: UnifiedUser['status']) => {
    const configs = {
      pending_approval: { 
        variant: "secondary" as const, 
        label: "Pending", 
        icon: AlertTriangle, 
        color: "text-amber-600",
        bgColor: "bg-amber-50"
      },
      approved: { 
        variant: "default" as const, 
        label: "Approved", 
        icon: UserCheck, 
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      active: { 
        variant: "default" as const, 
        label: "Active", 
        icon: UserCheck, 
        color: "text-green-600",
        bgColor: "bg-green-50"
      },
      suspended: { 
        variant: "destructive" as const, 
        label: "Suspended", 
        icon: UserX, 
        color: "text-red-600",
        bgColor: "bg-red-50"
      },
      rejected: { 
        variant: "destructive" as const, 
        label: "Rejected", 
        icon: UserX, 
        color: "text-red-600",
        bgColor: "bg-red-50"
      },
    };
    
    return configs[status];
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'master_admin': return 'destructive';
      case 'admin': return 'default';
      default: return 'outline';
    }
  };

  const handleQuickAction = async (user: UnifiedUser, action: 'approve' | 'reject') => {
    if (!user.approval_request_id) return;
    
    setUserLoading(user.id, action);
    try {
      if (action === 'approve') {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const { error } = await supabase.functions.invoke('approve-user', {
          body: { request_id: user.approval_request_id },
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (error) throw error;

        toast({
          title: '✅ User Approved',
          description: `${user.email} has been approved successfully.`,
        });
      } else {
        const { error } = await supabase
          .from('user_approval_requests')
          .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: (await supabase.auth.getUser()).data.user?.id,
            notes: 'Request rejected by admin'
          })
          .eq('id', user.approval_request_id);

        if (error) throw error;

        toast({
          title: 'Request Rejected',
          description: 'The approval request has been rejected',
        });
      }

      onUpdate();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    } finally {
      setUserLoading(user.id, null);
    }
  };

  const handleDeleteUser = async (user: UnifiedUser) => {
    if (user.roles.includes('master_admin')) {
      toast({
        title: "Cannot Delete Master Admin",
        description: "Master administrators cannot be deleted for security reasons.",
        variant: "destructive",
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.email}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setUserLoading(user.id, 'delete');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const payload: any = { user_ids: [], approval_request_ids: [] };
      if (user.profile) payload.user_ids = [user.id];
      if (user.approval_request_id) payload.approval_request_ids = [user.approval_request_id];

      const { data, error } = await supabase.functions.invoke('admin-delete-users', {
        body: payload,
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      const result = data as any;
      const anyDeleted = (result.deleted?.length || 0) > 0 || (result.deleted_requests || 0) > 0;
      const anyFailed = (result.failed?.length || 0) > 0;

      toast({
        title: anyDeleted ? "User Deleted" : 'Nothing deleted',
        description: anyFailed
          ? `Some parts failed. Deleted auth: ${result.deleted?.length || 0}, approval requests: ${result.deleted_requests || 0}`
          : anyDeleted
            ? `Removed ${result.deleted?.length || 0} account(s) and ${result.deleted_requests || 0} request(s)`
            : 'No user account or approval request found to delete',
        variant: anyFailed || !anyDeleted ? "destructive" : "default",
      });

      onUpdate();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setUserLoading(user.id, null);
    }
  };

  const handleSendEmail = (user: UnifiedUser) => {
    setSendEmailUser(user);
  };

  const handleSaveRoles = async (user: UnifiedUser, roles: string[]) => {
    setUserLoading(user.id, 'roles');
    try {
      // Remove existing roles
      await supabase.from('user_roles').delete().eq('user_id', user.id);
      // Insert new roles
      const inserts = roles.map((role) => ({ user_id: user.id, role }));
      if (inserts.length > 0) {
        const { error } = await supabase.from('user_roles').insert(inserts);
        if (error) throw error;
      }
      toast({ title: 'Roles updated', description: `Saved ${roles.length} role(s)` });
      onUpdate();
    } catch (error) {
      console.error('Error saving roles:', error);
      toast({ title: 'Error', description: 'Failed to update roles', variant: 'destructive' });
    } finally {
      setUserLoading(user.id, null);
      setManageRolesUser(null);
    }
  };

  const handleStatusChange = async (user: UnifiedUser, newStatus: UnifiedUser['status']) => {
    try {
      setUserLoading(user.id, 'status');
      
      if (user.approval_request_id) {
        // Update the approval request status
        const { error } = await supabase
          .from('user_approval_requests')
          .update({ status: newStatus })
          .eq('id', user.approval_request_id);
        
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: `User status changed to ${newStatus.replace('_', ' ')}`,
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    } finally {
      setUserLoading(user.id, null);
    }
  };

  const handleRoleChange = async (user: UnifiedUser, newRole: string) => {
    try {
      setUserLoading(user.id, 'role');
      
      // First delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);
      
      // Insert the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: newRole
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `User role changed to ${newRole.replace('_', ' ')}`,
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUserLoading(user.id, null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDisplayName = (user: UnifiedUser) => {
    return user.profile?.display_name || 
      `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || 
      user.email.split('@')[0];
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const statusConfig = getStatusConfig(user.status);
              const StatusIcon = statusConfig.icon;
              const userLoading = getUserLoading(user.id);
              
              return (
                <TableRow key={user.id} className="group hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={(checked) => onUserSelect(user.id, checked as boolean)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getDisplayName(user).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{getDisplayName(user)}</div>
                        <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                          <Badge variant={statusConfig.variant} className="gap-1 text-xs cursor-pointer hover:opacity-80">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {['pending_approval', 'approved', 'active', 'suspended', 'rejected'].map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(user, status as any)}
                            disabled={user.status === status}
                            className={user.status === status ? 'opacity-50' : ''}
                          >
                            {status.replace('_', ' ')} {user.status === status && '(current)'}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  
                   <TableCell>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                           <Badge
                             variant={getRoleBadgeVariant(user.roles[0] || 'user')}
                             className="text-xs hover:opacity-80 cursor-pointer"
                           >
                             {(user.roles[0] || 'user').replace('_', ' ')}
                           </Badge>
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="start" className="w-40">
                         <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         {['user', 'admin', 'master_admin'].map((role) => (
                           <DropdownMenuItem
                             key={role}
                             onClick={() => handleRoleChange(user, role)}
                             disabled={user.roles.includes(role)}
                             className={user.roles.includes(role) ? 'opacity-50' : ''}
                           >
                             {role.replace('_', ' ')} {user.roles.includes(role) && '✓'}
                           </DropdownMenuItem>
                         ))}
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </TableCell>
                  
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick Actions */}
                      {user.status === 'pending_approval' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleQuickAction(user, 'approve')}
                            disabled={userLoading === 'approve'}
                            className="h-7 px-2 text-xs"
                          >
                            {userLoading === 'approve' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserCheck className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleQuickAction(user, 'reject')}
                            disabled={userLoading === 'reject'}
                            className="h-7 px-2 text-xs"
                          >
                            {userLoading === 'reject' ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserX className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}

                      {user.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setProvisionUser(user)}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          Provision
                        </Button>
                      )}

                      {/* More Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            {userLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-3 w-3" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {(user.status === 'active' || user.status === 'approved' || user.status === 'needs_role') && (
                            <>
                              <DropdownMenuItem onClick={() => setPasswordResetUser(user)}>
                                <Key className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendEmail(user)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          
                          <DropdownMenuItem onClick={() => setManageRolesUser(user)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Roles
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.roles.includes('master_admin')}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {user.roles.includes('master_admin') ? 'Cannot Delete' : 'Delete User'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <PasswordResetDialog
        user={passwordResetUser}
        open={!!passwordResetUser}
        onOpenChange={(open) => !open && setPasswordResetUser(null)}
        onSuccess={onUpdate}
      />
      
      <ProvisionUserDialog
        user={provisionUser}
        open={!!provisionUser}
        onOpenChange={(open) => !open && setProvisionUser(null)}
        onSuccess={onUpdate}
      />
      
      <SendEmailDialog
        user={sendEmailUser}
        open={!!sendEmailUser}
        onOpenChange={(open) => !open && setSendEmailUser(null)}
      />

      <Dialog open={!!manageRolesUser} onOpenChange={(open) => !open && setManageRolesUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Roles</DialogTitle>
          </DialogHeader>
          {manageRolesUser && (
            <RoleSelector
              user={manageRolesUser as any}
              onSave={(roles) => handleSaveRoles(manageRolesUser, roles)}
              onCancel={() => setManageRolesUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}