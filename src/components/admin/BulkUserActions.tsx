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
import type { UnifiedUser } from "@/hooks/useUserManagement";

interface BulkUserActionsProps {
  selectedUserIds: string[];
  selectedUsers: UnifiedUser[];
  onActionComplete: () => void;
}

export function BulkUserActions({ selectedUserIds, selectedUsers, onActionComplete }: BulkUserActionsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const pendingUsers = selectedUsers.filter(u => u.status === 'pending_approval');
  const activeUsers = selectedUsers.filter(u => u.status === 'active' || u.status === 'approved');
  const nonAdminUsers = selectedUsers.filter(u => u.admin_role !== 'master_admin');

  const handleBulkApprove = async () => {
    if (pendingUsers.length === 0) {
      toast({
        title: "No pending users",
        description: "Select users with pending approval status to approve them",
        variant: "destructive",
      });
      return;
    }

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
    if (pendingUsers.length === 0) {
      toast({
        title: "No pending users",
        description: "Select users with pending approval status to reject them",
        variant: "destructive",
      });
      return;
    }

    const confirmReject = window.confirm(
      `Are you sure you want to reject ${pendingUsers.length} pending approval request(s)?`
    );

    if (!confirmReject) return;

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
    if (nonAdminUsers.length === 0) {
      toast({
        title: "No eligible users",
        description: "Select non-admin users to make them admins",
        variant: "destructive",
      });
      return;
    }

    const confirmAdmin = window.confirm(
      `Are you sure you want to make ${nonAdminUsers.length} user(s) admins? This gives them elevated privileges.`
    );

    if (!confirmAdmin) return;

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
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setLoading('delete');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const userIds = selectedUsers.filter(u => !!u.profile).map(u => u.id);
      const requestIds = selectedUsers.map(u => u.approval_request_id).filter(Boolean) as string[];

      const { data, error } = await supabase.functions.invoke('admin-delete-users', {
        body: { user_ids: userIds, approval_request_ids: requestIds },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      const result = data as any;
      const anyDeleted = (result.deleted?.length || 0) > 0 || (result.deleted_requests || 0) > 0;
      const anyFailed = (result.failed?.length || 0) > 0;

      toast({
        title: anyDeleted ? 'Users deleted' : 'Nothing deleted',
        description: anyFailed
          ? `Deleted accounts: ${result.deleted?.length || 0}, requests: ${result.deleted_requests || 0}. Failed: ${result.failed.length}`
          : `Deleted accounts: ${result.deleted?.length || 0}, requests: ${result.deleted_requests || 0}`,
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
                onClick={handleBulkApprove}
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
                onClick={handleBulkReject}
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
              onClick={handleBulkMakeAdmin}
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
            onClick={handleBulkDelete}
            disabled={loading === 'delete'}
            variant="destructive"
            size="sm"
            className="gap-1"
          >
            {loading === 'delete' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
            Delete {selectedUsers.length}
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
      </CardContent>
    </Card>
  );
}