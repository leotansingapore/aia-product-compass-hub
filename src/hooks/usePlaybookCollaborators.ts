import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { toast } from 'sonner';

export interface PlaybookCollaborator {
  id: string;
  playbook_id: string;
  user_id: string;
  granted_by: string;
  granted_at: string;
  profile?: { display_name: string | null; email: string | null; first_name: string | null; last_name: string | null };
}

export interface PlaybookEditRequest {
  id: string;
  playbook_id: string;
  requester_id: string;
  requester_name: string | null;
  requester_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function usePlaybookCollaborators(playbookId: string | null | undefined) {
  const { user } = useSimplifiedAuth();
  const queryClient = useQueryClient();

  // Fetch collaborators with profile info
  const { data: collaborators = [], isLoading: collaboratorsLoading } = useQuery({
    queryKey: ['playbook-collaborators', playbookId],
    queryFn: async () => {
      if (!playbookId) return [];
      const { data, error } = await supabase
        .from('playbook_collaborators' as any)
        .select('*')
        .eq('playbook_id', playbookId);
      if (error) throw error;

      const userIds = (data || []).map((c: any) => c.user_id);
      let profileMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, email, first_name, last_name')
          .in('user_id', userIds);
        if (profiles) {
          profiles.forEach(p => { profileMap[p.user_id] = p; });
        }
      }
      return (data || []).map((c: any) => ({ ...c, profile: profileMap[c.user_id] })) as PlaybookCollaborator[];
    },
    enabled: !!playbookId && !!user,
  });

  // Fetch pending edit requests (for owner)
  const { data: editRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['playbook-edit-requests', playbookId],
    queryFn: async () => {
      if (!playbookId) return [];
      const { data, error } = await supabase
        .from('playbook_edit_requests' as any)
        .select('*')
        .eq('playbook_id', playbookId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as PlaybookEditRequest[];
    },
    enabled: !!playbookId && !!user,
  });

  // Check current user's own request
  const myRequest = editRequests.find(r => r.requester_id === user?.id);

  // Check if current user is a collaborator
  const isCollaborator = collaborators.some(c => c.user_id === user?.id);

  // Add collaborator by user search
  const addCollaborator = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!playbookId || !user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('playbook_collaborators' as any)
        .insert({ playbook_id: playbookId, user_id: targetUserId, granted_by: user.id });
      if (error) {
        if (error.code === '23505') throw new Error('User already has edit access');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-collaborators', playbookId] });
      toast.success('Edit access granted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to grant access'),
  });

  // Remove collaborator
  const removeCollaborator = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from('playbook_collaborators' as any)
        .delete()
        .eq('id', collaboratorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-collaborators', playbookId] });
      toast.success('Edit access removed');
    },
    onError: () => toast.error('Failed to remove access'),
  });

  // Request edit access (for non-owners)
  const requestEditAccess = useMutation({
    mutationFn: async () => {
      if (!playbookId || !user) throw new Error('Not authenticated');
      const profile = await supabase.from('profiles').select('display_name, first_name, last_name, email').eq('user_id', user.id).single();
      const p = profile.data;
      const name = p?.display_name || `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Unknown';
      const { error } = await supabase
        .from('playbook_edit_requests' as any)
        .insert({
          playbook_id: playbookId,
          requester_id: user.id,
          requester_name: name,
          requester_email: user.email,
        });
      if (error) {
        if (error.code === '23505') throw new Error('You have already requested access');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-edit-requests', playbookId] });
      toast.success('Edit access request sent');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to send request'),
  });

  // Approve edit request
  const approveRequest = useMutation({
    mutationFn: async (request: PlaybookEditRequest) => {
      if (!playbookId || !user) throw new Error('Not authenticated');
      // Add as collaborator (ignore duplicate)
      await supabase
        .from('playbook_collaborators' as any)
        .insert({ playbook_id: playbookId, user_id: request.requester_id, granted_by: user.id })
        .then(() => null); // ignore errors (duplicate = already has access)

      // Update request status
      const { error } = await supabase
        .from('playbook_edit_requests' as any)
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user.id })
        .eq('id', request.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-edit-requests', playbookId] });
      queryClient.invalidateQueries({ queryKey: ['playbook-collaborators', playbookId] });
      toast.success('Request approved — user can now edit');
    },
    onError: () => toast.error('Failed to approve request'),
  });

  // Reject edit request
  const rejectRequest = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('playbook_edit_requests' as any)
        .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: user.id })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-edit-requests', playbookId] });
      toast.success('Request rejected');
    },
    onError: () => toast.error('Failed to reject request'),
  });

  return {
    collaborators,
    collaboratorsLoading,
    editRequests,
    requestsLoading,
    myRequest,
    isCollaborator,
    addCollaborator,
    removeCollaborator,
    requestEditAccess,
    approveRequest,
    rejectRequest,
  };
}
