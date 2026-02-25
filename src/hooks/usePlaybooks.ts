import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { toast } from 'sonner';

export interface Playbook {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  share_token: string | null;
  allow_public_edit: boolean;
  items?: PlaybookItem[];
  creator_name?: string;
}

export interface PlaybookItem {
  id: string;
  playbook_id: string;
  script_id: string | null;
  objection_id: string | null;
  item_type: 'script' | 'objection';
  sort_order: number;
  created_at: string;
  custom_content?: { version_index?: number } | null;
}

export function usePlaybooks() {
  const { user } = useSimplifiedAuth();
  const queryClient = useQueryClient();

  const { data: playbooks = [], isLoading } = useQuery({
    queryKey: ['playbooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('script_playbooks')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;

      // Fetch creator names
      const creatorIds = [...new Set((data || []).map(p => p.created_by))];
      let creatorMap: Record<string, string> = {};
      if (creatorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, first_name, last_name')
          .in('user_id', creatorIds);
        if (profiles) {
          profiles.forEach(p => {
            creatorMap[p.user_id] = p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown';
          });
        }
      }

      return (data || []).map(p => ({
        ...p,
        creator_name: creatorMap[p.created_by] || 'Unknown'
      })) as Playbook[];
    },
  });

  const myPlaybooks = playbooks.filter(p => p.created_by === user?.id);

  const createPlaybook = useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('script_playbooks')
        .insert({ title, description: description || null, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('Playbook created');
    },
    onError: () => toast.error('Failed to create playbook'),
  });

  const updatePlaybook = useMutation({
    mutationFn: async ({ id, title, description }: { id: string; title: string; description?: string }) => {
      const { error } = await supabase
        .from('script_playbooks')
        .update({ title, description: description || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('Playbook updated');
    },
    onError: () => toast.error('Failed to update playbook'),
  });

  const deletePlaybook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('script_playbooks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      toast.success('Playbook deleted');
    },
    onError: () => toast.error('Failed to delete playbook'),
  });

  const togglePublic = useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      const updates: any = { is_public: isPublic };
      if (isPublic) {
        // Generate a share token if making public
        const playbook = playbooks.find(p => p.id === id);
        if (!playbook?.share_token) {
          updates.share_token = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
        }
      }
      const { data, error } = await supabase
        .from('script_playbooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playbooks'] });
      if (data.is_public) {
        toast.success('Playbook is now public');
      } else {
        toast.success('Playbook is now private');
      }
    },
    onError: () => toast.error('Failed to update sharing'),
  });

  return { playbooks, myPlaybooks, isLoading, createPlaybook, updatePlaybook, deletePlaybook, togglePublic, userId: user?.id };
}

export function usePlaybookItems(playbookId: string | null) {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['playbook-items', playbookId],
    queryFn: async () => {
      if (!playbookId) return [];
      const { data, error } = await supabase
        .from('script_playbook_items')
        .select('*')
        .eq('playbook_id', playbookId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as PlaybookItem[];
    },
    enabled: !!playbookId,
  });

  const addItem = useMutation({
    mutationFn: async ({ scriptId, objectionId, itemType = 'script', versionIndex }: { scriptId?: string; objectionId?: string; itemType?: 'script' | 'objection'; versionIndex?: number }) => {
      if (!playbookId) throw new Error('No playbook selected');
      const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 1 : 0;
      const customContent = versionIndex !== undefined ? { version_index: versionIndex } : null;
      const { error } = await supabase
        .from('script_playbook_items')
        .insert({
          playbook_id: playbookId,
          script_id: itemType === 'script' ? scriptId! : null,
          objection_id: itemType === 'objection' ? objectionId! : null,
          item_type: itemType,
          sort_order: maxOrder,
          custom_content: customContent,
        } as any);
      if (error) {
        if (error.code === '23505') throw new Error('Item already in playbook');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-items', playbookId] });
      toast.success('Added to playbook');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to add item'),
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('script_playbook_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-items', playbookId] });
      toast.success('Script removed from playbook');
    },
    onError: () => toast.error('Failed to remove script'),
  });

  const reorderItems = useMutation({
    mutationFn: async (reorderedItems: { id: string; sort_order: number }[]) => {
      const promises = reorderedItems.map(item =>
        supabase
          .from('script_playbook_items')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)
      );
      const results = await Promise.all(promises);
      const error = results.find(r => r.error);
      if (error?.error) throw error.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-items', playbookId] });
    },
    onError: () => toast.error('Failed to reorder'),
  });

  return { items, isLoading, addItem, removeItem, reorderItems };
}
