import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Mail, 
  Settings, 
  Trash2, 
  AlertTriangle,
  Shield,
  User,
  Award
} from "lucide-react";
import type { UnifiedUser } from "@/hooks/useUserManagement";
import { SendEmailDialog } from "./SendEmailDialog";
import { getRoleBadgeVariant } from "@/utils/userUtils";
import { TierBadge } from "@/components/tier/TierBadge";
import { TierControl } from "@/components/admin/TierControl";

interface UserDirectoryRowProps {
  user: UnifiedUser;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onUpdate: () => void;
}

export function UserDirectoryRow({ user, isSelected, onSelect, onUpdate }: UserDirectoryRowProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  

  const displayName = user.profile?.display_name || 
    `${user.profile?.first_name || ''} ${user.profile?.last_name || ''}`.trim() || 
    user.email.split('@')[0];

  const getStatusBadge = (status: UnifiedUser['status']) => {
    const variants = {
      pending_approval: { variant: "secondary" as const, label: "Pending Approval", icon: AlertTriangle },
      approved: { variant: "default" as const, label: "Approved", icon: UserCheck },
      active: { variant: "default" as const, label: "Active", icon: UserCheck },
      needs_role: { variant: "outline" as const, label: "Needs Role", icon: Settings },
      suspended: { variant: "destructive" as const, label: "Suspended", icon: UserX },
      rejected: { variant: "destructive" as const, label: "Rejected", icon: UserX },
    };
    
    const config = variants[status];
    const IconComponent = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={`gap-1 ${
          config.variant === 'secondary'
            ? 'text-black'
            : 'text-white'
        }`}
      >
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getLocalRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'master_admin': return 'destructive';
      case 'admin': return 'default';
      case 'mentor': return 'secondary';
      default: return 'outline';
    }
  };

  const getCurrentAdminRole = () => {
    return user.admin_role || 'user';
  };

  const getAdminIcon = (role: string) => {
    switch (role) {
      case 'master_admin': return Shield;
      case 'admin': return Shield;
      case 'mentor': return Award;
      default: return User;
    }
  };

  const handleApprove = async () => {
    if (!user.approval_request_id) return;
    
    setLoading('approve');
    try {
      const { error } = await supabase
        .from('user_approval_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', user.approval_request_id);

      if (error) throw error;

      toast({
        title: '✅ User Approved',
        description: `${user.email} has been approved. They can now sign in with their original password.`,
        duration: 8000
      });

      onUpdate();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!user.approval_request_id) return;
    
    setLoading('reject');
    try {
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

      onUpdate();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSendResetLink = async () => {
    setLoading('reset');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('generate-password-reset-link', {
        body: { email: user.email, send: true },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      toast({ 
        title: 'Password reset link sent', 
        description: 'User will receive an email shortly.' 
      });
    } catch (error) {
      console.error('Error sending reset link:', error);
      toast({
        title: "Error",
        description: "Failed to send reset link",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSetTempPassword = async () => {
    const newPassword = prompt('Enter a new temporary password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      if (newPassword !== null) {
        toast({
          title: 'Password too short',
          description: 'Must be at least 6 characters.',
          variant: 'destructive'
        });
      }
      return;
    }
    
    setLoading('setTemp');
    try {
      const { error } = await supabase.functions.invoke('admin-change-user-password', {
        body: { userId: user.id, newPassword },
      });

      if (error) throw error;

      toast({
        title: 'Password updated',
        description: 'Temporary password set successfully.'
      });
    } catch (error) {
      console.error('Error setting temp password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleAdminRoleChange = async (newRole: string) => {
    try {
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      
      // Update admin role using upsert (handles both insert and update)
      const { error } = await supabase
        .from('user_admin_roles')
        .upsert({
          user_id: user.id,
          admin_role: newRole,
          granted_by: currentUserId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating admin role:', error);
      toast({
        title: "Error",
        description: "Failed to update user admin role",
        variant: "destructive",
      });
    }
  };

  const handleToggleAdmin = async () => {
    const currentAdminRole = getCurrentAdminRole();
    const newRole = currentAdminRole === 'admin' ? 'user' : 'admin';
    await handleAdminRoleChange(newRole);
  };

  const currentAdminRole = getCurrentAdminRole();
  const AdminIcon = getAdminIcon(currentAdminRole);

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(e.target.checked)}
        className="rounded"
        aria-label={`Select user ${user.email}`}
      />
      
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.profile?.avatar_url || undefined} />
        <AvatarFallback>
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold truncate">{displayName}</h3>
          {getStatusBadge(user.status)}
        </div>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        <p className="text-micro text-muted-foreground">
          Created {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Role + Tier Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={getLocalRoleBadgeVariant(user.admin_role || 'user')}
            className="gap-1 text-micro"
          >
            <Shield className="h-3 w-3" />
            {user.admin_role || 'user'}
          </Badge>
          <TierBadge tier={user.access_tier} compact />
        </div>

        {/* Admin Role Management */}
        {user.status === 'active' && (
          <div className="flex items-center gap-2">
            <AdminIcon className="h-4 w-4 text-muted-foreground" />
            <Select value={currentAdminRole} onValueChange={handleAdminRoleChange}>
              <SelectTrigger className="w-32 h-8 text-micro">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="master_admin">Master Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tier Management */}
        {user.status === 'active' && user.admin_role !== 'master_admin' && (
          <TierControl
            userId={user.id}
            currentTier={user.access_tier}
            compact
            onChange={() => onUpdate()}
          />
        )}
      </div>

      {/* Action Buttons for Pending Approval */}
      {user.status === 'pending_approval' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={handleApprove}
            disabled={loading === 'approve'}
            className="text-micro"
          >
            <UserCheck className="h-3 w-3 mr-1" />
            {loading === 'approve' ? 'Approving...' : 'Approve'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReject}
            disabled={loading === 'reject'}
            className="text-micro"
          >
            <UserX className="h-3 w-3 mr-1" />
            {loading === 'reject' ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      )}

      {/* More Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(user.status === 'active' || user.status === 'approved') && (
            <>
              <DropdownMenuItem onClick={handleSendResetLink} disabled={loading === 'reset'}>
              <Mail className="h-4 w-4 mr-2" />
                Send Reset Link
              </DropdownMenuItem>
              {user.admin_role !== 'master_admin' && (
                <DropdownMenuItem onClick={handleToggleAdmin}>
                  <Shield className="h-4 w-4 mr-2" />
                  {user.admin_role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </DropdownMenuItem>
              )}
            </>
          )}
          <DropdownMenuItem onClick={() => setShowEmailDialog(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <SendEmailDialog
        user={user}
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
      />
    </div>
  );
}
