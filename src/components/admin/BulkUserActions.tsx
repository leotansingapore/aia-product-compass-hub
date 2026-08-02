import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  UserCheck, 
  UserX, 
  Mail, 
  Trash2, 
  Users, 
  Loader2,
  Shield,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmActionDialog } from "./ConfirmActionDialog";
import type { UnifiedUser } from "@/hooks/useUserManagement";

interface BulkUserActionsProps {
  selectedUserIds: string[];
  selectedUsers: UnifiedUser[];
  onActionComplete: () => void;
}

type BulkAction = 'approve' | 'reject' | 'admin' | 'delete';

export function BulkUserActions({ selectedUserIds, selectedUsers, onActionComplete }: BulkUserActionsProps) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;
  const [loading, setLoading] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<BulkAction | null>(null);

  const pendingUsers = selectedUsers.filter(u => u.status === 'pending_approval');
  const activeUsers = selectedUsers.filter(u => u.status === 'active' || u.status === 'approved');
  const nonAdminUsers = selectedUsers.filter(u => u.admin_role !== 'master_admin');

  // Deletion guards — mirror the single-row rules in useUserActions.deleteUser so
  // bulk delete can't be used as a bypass. Deleting a master admin (or yourself)
  // permanently locks the org out of /admin.
  const excludedFromDelete = selectedUsers
    .map(u => {
      if (u.admin_role === 'master_admin') return { email: u.email, reason: 'master admin' };
      if (currentUserId && u.id === currentUserId) return { email: u.email, reason: 'your own account' };
      return null;
    })
    .filter(Boolean) as { email: string; reason: string }[];
  const excludedEmails = new Set(excludedFromDelete.map(e => e.email));
  const deletableUsers = selectedUsers.filter(u => !excludedEmails.has(u.email));

  /** Validate the selection, then open the confirmation dialog for `action`. */
  const requestAction = (action: BulkAction) => {
    if ((action === 'approve' || action === 'reject') && pendingUsers.length === 0) {
      toast({
        title: "No pending users",
        description: `Select users with pending approval status to ${action} them`,
        variant: "destructive",
      });
      return;
    }
    if (action === 'admin' && nonAdminUsers.length === 0) {
      toast({
        title: "No eligible users",
        description: "Select non-admin users to make them admins",
        variant: "destructive",
      });
      return;
    }
    if (action === 'delete' && deletableUsers.length === 0) {
      toast({
        title: 'Nothing to delete',
        description: excludedFromDelete.length > 0
          ? `All ${excludedFromDelete.length} selected user(s) are protected: ${excludedFromDelete.map(e => `${e.email} (${e.reason})`).join(', ')}.`
          : 'Select at least one user to delete.',
        variant: 'destructive',
      });
      return;
    }
    setConfirming(action);
  };

  const handleBulkApprove = async () => {
    setLoading('approve');
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const user of pendingUsers) {
        if (!user.approval_request_id) continue;
        
        try {
          const { error } = await supabase
            .from('user_approval_requests')
            .update({ status: 'approved', reviewed_at: new Date().toISOString() })
            .eq('id', user.approval_request_id);

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error(`Error approving user ${user.email}:`, error);
          errorCount++;
        }
      }

      toast({
        title: `Bulk Approval Complete`,
        description: `Approved ${successCount} users${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

      onActionComplete();
    } catch (error) {
      console.error('Error in bulk approve:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk approval",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBulkReject = async () => {
    setLoading('reject');
    try {
      const userIds = pendingUsers.map(u => u.approval_request_id).filter(Boolean);
      
      const { error } = await supabase
        .from('user_approval_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          notes: 'Bulk rejected by admin'
        })
        .in('id', userIds);

      if (error) throw error;

      toast({
        title: 'Bulk Rejection Complete',
        description: `Rejected ${pendingUsers.length} approval requests`,
      });

      onActionComplete();
    } catch (error) {
      console.error('Error in bulk reject:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk rejection",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBulkSendResetLinks = async () => {
    if (activeUsers.length === 0) {
      toast({
        title: "No active users",
        description: "Select active users to send password reset links",
        variant: "destructive",
      });
      return;
    }

    setLoading('reset');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      let successCount = 0;
      let errorCount = 0;

      for (const user of activeUsers) {
        try {
          const { error } = await supabase.functions.invoke('generate-password-reset-link', {
            body: { email: user.email, send: true },
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (error) throw error;
          successCount++;
        } catch (error) {
          console.error(`Error sending reset link to ${user.email}:`, error);
          errorCount++;
        }
      }

      toast({
        title: `Reset Links Sent`,
        description: `Sent to ${successCount} users${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

      onActionComplete();
    } catch (error) {
      console.error('Error in bulk reset links:', error);
      toast({
        title: "Error",
        description: "Failed to send reset links",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBulkMakeAdmin = async () => {
    setLoading('admin');
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const user of nonAdminUsers) {
        try {
          // Update admin role to 'admin'
          await supabase
            .from('user_admin_roles')
            .delete()
            .eq('user_id', user.id);
          
          const { error } = await supabase
            .from('user_admin_roles')
            .insert({
              user_id: user.id,
              admin_role: 'admin'
            });
          
          if (error) throw error;
          
          successCount++;
        } catch (error) {
          console.error(`Error making user ${user.email} admin:`, error);
          errorCount++;
        }
      }

      toast({
        title: `Admin Assignment Complete`,
        description: `Made ${successCount} users admins${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

      onActionComplete();
    } catch (error) {
      console.error('Error in bulk admin assignment:', error);
      toast({
        title: "Error",
        description: "Failed to assign admin roles",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    setLoading('delete');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const userIds = deletableUsers.filter(u => !!u.profile).map(u => u.id);
      const requestIds = deletableUsers.map(u => u.approval_request_id).filter(Boolean) as string[];

      const { data, error } = await supabase.functions.invoke('admin-delete-users', {
        body: { user_ids: userIds, approval_request_ids: requestIds },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      const result = data as any;
      const anyDeleted = (result.deleted?.length || 0) > 0 || (result.deleted_requests || 0) > 0;
      const anyFailed = (result.failed?.length || 0) > 0;

      const skippedNote = excludedFromDelete.length > 0
        ? ` Skipped ${excludedFromDelete.length}: ${excludedFromDelete.map(e => `${e.email} (${e.reason})`).join(', ')}.`
        : '';

      toast({
        title: anyDeleted ? 'Users deleted' : 'Nothing deleted',
        description: (anyFailed
          ? `Deleted accounts: ${result.deleted?.length || 0}, requests: ${result.deleted_requests || 0}. Failed: ${result.failed.length}`
          : `Deleted accounts: ${result.deleted?.length || 0}, requests: ${result.deleted_requests || 0}`) + skippedNote,
        variant: anyFailed || !anyDeleted ? 'destructive' : 'default',
      });

      onActionComplete();
    } catch (error) {
      console.error('Error deleting users:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete users',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const CONFIRM_CONFIG: Record<BulkAction, {
    title: string;
    description: string;
    items: string[];
    itemsLabel: string;
    confirmLabel: string;
    destructive: boolean;
    run: () => Promise<void>;
  }> = {
    approve: {
      title: 'Approve these users?',
      description:
        'Approving grants each of these accounts access to the platform. Review the list before confirming.',
      items: pendingUsers.map(u => u.email),
      itemsLabel: 'Will be approved',
      confirmLabel: `Approve ${pendingUsers.length}`,
      destructive: false,
      run: handleBulkApprove,
    },
    reject: {
      title: 'Reject these approval requests?',
      description:
        'These people will not get access. They will need to request approval again.',
      items: pendingUsers.map(u => u.email),
      itemsLabel: 'Will be rejected',
      confirmLabel: `Reject ${pendingUsers.length}`,
      destructive: true,
      run: handleBulkReject,
    },
    admin: {
      title: 'Grant admin privileges?',
      description:
        'Admins can see and edit every user, question bank and platform setting. Only grant this to people who should have full control.',
      items: nonAdminUsers.map(u => u.email),
      itemsLabel: 'Will become admins',
      confirmLabel: `Make ${nonAdminUsers.length} admin${nonAdminUsers.length === 1 ? '' : 's'}`,
      destructive: true,
      run: handleBulkMakeAdmin,
    },
    delete: {
      title: 'Delete these accounts?',
      description: excludedFromDelete.length > 0
        ? `This permanently removes the accounts below, along with their progress. It cannot be undone. ${excludedFromDelete.length} selected account(s) are protected and will be skipped: ${excludedFromDelete.map(e => `${e.email} (${e.reason})`).join(', ')}.`
        : 'This permanently removes the accounts below, along with their progress. It cannot be undone.',
      items: deletableUsers.map(u => u.email),
      itemsLabel: 'Will be deleted',
      confirmLabel: `Delete ${deletableUsers.length}`,
      destructive: true,
      run: handleBulkDelete,
    },
  };

  const activeConfirm = confirming ? CONFIRM_CONFIG[confirming] : null;

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Bulk Actions ({selectedUsers.length} selected)
        </CardTitle>
        <CardDescription>
          Perform actions on multiple users at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {/* Approval Actions */}
          {pendingUsers.length > 0 && (
            <>
              <Button 
                onClick={() => requestAction('approve')}
                disabled={loading === 'approve'}
                variant="default"
                size="sm"
                className="gap-1"
              >
                {loading === 'approve' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <UserCheck className="h-3 w-3" />
                )}
                Approve {pendingUsers.length}
              </Button>
              
              <Button 
                onClick={() => requestAction('reject')}
                disabled={loading === 'reject'}
                variant="destructive"
                size="sm"
                className="gap-1"
              >
                {loading === 'reject' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <UserX className="h-3 w-3" />
                )}
                Reject {pendingUsers.length}
              </Button>
            </>
          )}
          
          {/* Active User Actions */}
          {activeUsers.length > 0 && (
            <>
              <Button 
                onClick={handleBulkSendResetLinks}
                disabled={loading === 'reset'}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                {loading === 'reset' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Mail className="h-3 w-3" />
                )}
                Send Reset Links ({activeUsers.length})
              </Button>
            </>
          )}
          
          {/* Admin Actions */}
          {nonAdminUsers.length > 0 && (
            <Button 
              onClick={() => requestAction('admin')}
              disabled={loading === 'admin'}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              {loading === 'admin' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Shield className="h-3 w-3" />
              )}
              Make Admin ({nonAdminUsers.length})
            </Button>
          )}
          
          {/* Delete Action */}
          <Button
            onClick={() => requestAction('delete')}
            disabled={loading === 'delete' || deletableUsers.length === 0}
            variant="destructive"
            size="sm"
            className="gap-1"
          >
            {loading === 'delete' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
            Delete {deletableUsers.length}
          </Button>
        </div>
        
        {/* Selection Summary */}
        <div className="flex flex-wrap gap-1 mt-3">
          {pendingUsers.length > 0 && (
            <Badge variant="secondary" className="text-micro">
              {pendingUsers.length} pending
            </Badge>
          )}
          {activeUsers.length > 0 && (
            <Badge variant="default" className="text-micro">
              {activeUsers.length} active
            </Badge>
          )}
          {nonAdminUsers.length > 0 && (
            <Badge variant="outline" className="text-micro">
              {nonAdminUsers.length} non-admin
            </Badge>
          )}
        </div>

        {excludedFromDelete.length > 0 && (
          <p className="mt-2 text-micro text-muted-foreground">
            Protected from deletion:{' '}
            {excludedFromDelete.map(e => `${e.email} (${e.reason})`).join(', ')}. Deleting a master
            admin or your own account would lock you out of the admin area.
          </p>
        )}

        {activeConfirm && (
          <ConfirmActionDialog
            open
            onOpenChange={(open) => { if (!open) setConfirming(null); }}
            title={activeConfirm.title}
            description={activeConfirm.description}
            items={activeConfirm.items}
            itemsLabel={activeConfirm.itemsLabel}
            confirmLabel={activeConfirm.confirmLabel}
            destructive={activeConfirm.destructive}
            onConfirm={() => {
              setConfirming(null);
              void activeConfirm.run();
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}