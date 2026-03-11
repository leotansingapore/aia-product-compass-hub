import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
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
  MoreHorizontal,
  Loader2,
  Mail,
  Key,
  Trash2,
  ExternalLink,
  Shield
} from "lucide-react";
import { UnifiedUser } from '@/hooks/useUserManagement';
import { useUserActions } from '@/hooks/useUserActions';
import { getDisplayName, getStatusConfig, getRoleBadgeVariant, AVAILABLE_STATUSES, AVAILABLE_ADMIN_ROLES } from '@/utils/userUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserTableRowProps {
  user: UnifiedUser;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onUpdate: () => void;
  onPasswordReset: (user: UnifiedUser) => void;
  onProvision: (user: UnifiedUser) => void;
  onSendEmail: (user: UnifiedUser) => void;
}

export const UserTableRow = memo(function UserTableRow({ 
  user, 
  isSelected, 
  onSelect, 
  onUpdate,
  onPasswordReset,
  onProvision,
  onSendEmail
}: UserTableRowProps) {
  const { 
    loading, 
    approveUser, 
    rejectUser, 
    deleteUser, 
    updateUserStatus
  } = useUserActions();

  const statusConfig = getStatusConfig(user.status);
  const userLoading = loading(user.id);
  
  // Use admin_role from props (single source of truth)
  const adminRole = user.admin_role || 'user';

  const handleQuickAction = async (action: 'approve' | 'reject') => {
    const success = action === 'approve' ? 
      await approveUser(user) : 
      await rejectUser(user);
    
    if (success) onUpdate();
  };

  const handleStatusChange = async (newStatus: UnifiedUser['status']) => {
    const success = await updateUserStatus(user, newStatus);
    if (success) onUpdate();
  };

  const handleAdminRoleChange = async (newRole: string) => {
    try {
      // Update admin role in user_admin_roles table
      const { error: deleteError } = await supabase
        .from('user_admin_roles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_admin_roles')
        .insert({
          user_id: user.id,
          admin_role: newRole
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `Admin role updated to ${newRole.replace('_', ' ')}`,
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Error updating admin role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update admin role",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    const success = await deleteUser(user);
    if (success) onUpdate();
  };

  return (
    <TableRow className="group hover:bg-muted/30">
      <TableCell>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="cursor-pointer"
          aria-label={`Select user ${user.email}`}
        />
      </TableCell>

      <TableCell className="md:max-w-[200px] lg:max-w-none">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profile?.avatar_url || undefined} />
            <AvatarFallback className="text-micro">
              {getDisplayName(user).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{getDisplayName(user)}</div>
            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>
      </TableCell>
      
      {/* Status Dropdown */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
              <Badge
                variant={statusConfig.variant}
                className={`gap-1 text-micro cursor-pointer hover:opacity-80 ${
                  statusConfig.variant === 'secondary'
                    ? 'text-black'
                    : 'text-white'
                }`}
              >
                {statusConfig.label}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {AVAILABLE_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={user.status === status}
                className={user.status === status ? 'opacity-50' : ''}
              >
                {status.replace('_', ' ')} {user.status === status && '(current)'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      
      {/* Admin Role Dropdown */}
      <TableCell>
        {adminRole === 'master_admin' ? (
          <Badge variant="destructive" className="text-micro">
            <Shield className="h-3 w-3 mr-1" />
            Master Admin
          </Badge>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                <Badge
                  variant={getRoleBadgeVariant(adminRole)}
                  className="text-micro hover:opacity-80 cursor-pointer"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {adminRole.replace('_', ' ')}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuLabel>Admin Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AVAILABLE_ADMIN_ROLES.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleAdminRoleChange(role)}
                  disabled={adminRole === role}
                  className={adminRole === role ? 'opacity-50' : ''}
                >
                  {role.replace('_', ' ')} {adminRole === role && '✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Quick Actions for Pending Users */}
          {user.status === 'pending_approval' && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleQuickAction('approve')}
                disabled={userLoading === 'approve'}
                className="h-7 px-2 text-micro"
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
                onClick={() => handleQuickAction('reject')}
                disabled={userLoading === 'reject'}
                className="h-7 px-2 text-micro"
              >
                {userLoading === 'reject' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <UserX className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          {/* Provision Button for Approved Users */}
          {user.status === 'approved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onProvision(user)}
              className="h-7 px-2 text-micro"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label={`More options for ${user.email}`}>
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onSendEmail(user)}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              
              {user.profile && (
                <DropdownMenuItem onClick={() => onPasswordReset(user)}>
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={userLoading === 'delete'}
                className="text-destructive focus:text-destructive"
              >
                {userLoading === 'delete' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
});
