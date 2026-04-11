import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UnifiedUser } from './useUserManagement';

export function useUserActions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<{ [key: string]: string | null }>({});

  const setUserLoading = (userId: string, type: string | null) => {
    setLoading(prev => ({ ...prev, [userId]: type }));
  };

  const getUserLoading = (userId: string) => loading[userId] || null;

  const approveUser = async (user: UnifiedUser) => {
    if (!user.approval_request_id) return;
    
    setUserLoading(user.id, 'approve');
    try {
      const { error } = await supabase
        .from('user_approval_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', user.approval_request_id);

      if (error) throw error;

      toast({
        title: '✅ User Approved',
        description: `${user.email} has been approved successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
      return false;
    } finally {
      setUserLoading(user.id, null);
    }
  };

  const rejectUser = async (user: UnifiedUser) => {
    if (!user.approval_request_id) return;
    
    setUserLoading(user.id, 'reject');
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

      return true;
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
      return false;
    } finally {
      setUserLoading(user.id, null);
    }
  };

  const deleteUser = async (user: UnifiedUser) => {
    if (user.admin_role === 'master_admin') {
      toast({
        title: "Cannot Delete Master Admin",
        description: "Master administrators cannot be deleted for security reasons.",
        variant: "destructive",
      });
      return false;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${user.email}? This action cannot be undone.`
    );

    if (!confirmDelete) return false;

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

      return anyDeleted;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      return false;
    } finally {
      setUserLoading(user.id, null);
    }
  };

  const updateUserStatus = async (user: UnifiedUser, newStatus: UnifiedUser['status']) => {
    setUserLoading(user.id, 'status');
    try {
      if (user.approval_request_id) {
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
      
      return true;
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
      return false;
    } finally {
      setUserLoading(user.id, null);
    }
  };

  const updateUserRole = async (user: UnifiedUser, newRole: string) => {
    setUserLoading(user.id, 'role');
    try {
      // Delete existing roles
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
      
      return true;
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
      return false;
    } finally {
      setUserLoading(user.id, null);
    }
  };

  return {
    loading: getUserLoading,
    approveUser,
    rejectUser,
    deleteUser,
    updateUserStatus,
    updateUserRole
  };
}