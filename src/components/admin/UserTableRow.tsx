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
  ExternalLink
} from "lucide-react";
import { UnifiedUser } from '@/hooks/useUserManagement';
import { useUserActions } from '@/hooks/useUserActions';
import { getDisplayName, formatDate, getStatusConfig, getRoleBadgeVariant, AVAILABLE_STATUSES, AVAILABLE_ROLES } from '@/utils/userUtils';

interface UserTableRowProps {
  user: UnifiedUser;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onUpdate: () => void;
  onPasswordReset: (user: UnifiedUser) => void;
  onProvision: (user: UnifiedUser) => void;
  onSendEmail: (user: UnifiedUser) => void;
}

export function UserTableRow({ 
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
    updateUserStatus, 
    updateUserRole 
  } = useUserActions();

  const statusConfig = getStatusConfig(user.status);
  const userLoading = loading(user.id);

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

  const handleRoleChange = async (newRole: string) => {
    const success = await updateUserRole(user, newRole);
    if (success) onUpdate();
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
                  statusConfig.variant === 'outline' || statusConfig.variant === 'secondary'
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
      
      {/* Role Dropdown */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
              <Badge
                variant={getRoleBadgeVariant(user.roles[0] || 'user')}
                className={`text-micro hover:opacity-80 cursor-pointer ${
                  getRoleBadgeVariant(user.roles[0] || 'user') === 'outline'
                    ? 'text-black'
                    : 'text-white'
                }`}
              >
                {(user.roles[0] || 'user').replace('_', ' ')}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {AVAILABLE_ROLES.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleChange(role)}
                disabled={user.roles.includes(role)}
                className={user.roles.includes(role) ? 'opacity-50' : ''}
              >
                {role.replace('_', ' ')} {user.roles.includes(role) && '✓'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
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
}