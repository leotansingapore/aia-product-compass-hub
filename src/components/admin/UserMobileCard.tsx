import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
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
import { TierBadge } from '@/components/tier/TierBadge';
import { TierControl } from '@/components/admin/TierControl';

interface UserMobileCardProps {
  user: UnifiedUser;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onUpdate: () => void;
  onPasswordReset: (user: UnifiedUser) => void;
  onProvision: (user: UnifiedUser) => void;
  onSendEmail: (user: UnifiedUser) => void;
}

export const UserMobileCard = memo(function UserMobileCard({ 
  user, 
  isSelected, 
  onSelect, 
  onUpdate,
  onPasswordReset,
  onProvision,
  onSendEmail
}: UserMobileCardProps) {
  const { 
    loading, 
    approveUser, 
    rejectUser, 
    deleteUser, 
    updateUserStatus
  } = useUserActions();

  const statusConfig = getStatusConfig(user.status);
  const userLoading = loading(user.id);
  
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
    <Card className={`transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''}`}>
      <CardContent className="p-4 space-y-4">
        {/* Header Row: Checkbox, Avatar, Name, Actions */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="cursor-pointer mt-2 h-4 w-4"
            aria-label={`Select user ${user.email}`}
          />
          
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user.profile?.avatar_url || undefined} />
            <AvatarFallback className="text-sm">
              {getDisplayName(user).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{getDisplayName(user)}</div>
            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
          </div>
          
          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
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

        {/* Status & Roles Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                <Badge
                  variant={statusConfig.variant}
                  className={`text-xs cursor-pointer hover:opacity-80 ${
                    statusConfig.variant === 'secondary' ? 'text-black' : 'text-white'
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

          {/* Admin Role Dropdown */}
          {adminRole === 'master_admin' ? (
            <Badge variant="destructive" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Master Admin
            </Badge>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                  <Badge
                    variant={getRoleBadgeVariant(adminRole)}
                    className="text-xs hover:opacity-80 cursor-pointer"
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

          <TierBadge tier={user.access_tier} compact />
        </div>

        {/* Tier control (hidden for master admin) */}
        {user.status === 'active' && adminRole !== 'master_admin' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Tier</span>
            <TierControl
              userId={user.id}
              currentTier={user.access_tier}
              compact
              onChange={() => onUpdate()}
            />
          </div>
        )}

        {/* Quick Actions for Pending Users */}
        {user.status === 'pending_approval' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleQuickAction('approve')}
              disabled={userLoading === 'approve'}
              className="flex-1 min-h-[44px]"
            >
              {userLoading === 'approve' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <UserCheck className="h-4 w-4 mr-1" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleQuickAction('reject')}
              disabled={userLoading === 'reject'}
              className="flex-1 min-h-[44px]"
            >
              {userLoading === 'reject' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <UserX className="h-4 w-4 mr-1" />
              )}
              Reject
            </Button>
          </div>
        )}

        {/* Provision Button for Approved Users */}
        {user.status === 'approved' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onProvision(user)}
            className="w-full min-h-[44px]"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Provision Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
