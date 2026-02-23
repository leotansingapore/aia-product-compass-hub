import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { toast } from 'sonner';

export interface ScriptUserVersion {
  id: string;
  script_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useScriptUserVersions(scriptId: string | null) {
  const { user } = useSimplifiedAuth();
  const queryClient = useQueryClient();

  const { data: userVersions = [], isLoading } = useQuery({
    queryKey: ['script-user-versions', scriptId],
    queryFn: async () => {
      if (!scriptId) return [];
      const { data, error } = await supabase
        .from('script_user_versions')
        .select('*')
        .eq('script_id', scriptId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ScriptUserVersion[];
    },
    enabled: !!scriptId,
  });

  const addVersion = useMutation({
    mutationFn: async ({ content, authorName }: { content: string; authorName: string }) => {
      if (!user || !scriptId) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('script_user_versions')
        .insert({ script_id: scriptId, user_id: user.id, author_name: authorName, content })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script-user-versions', scriptId] });
      toast.success('Your version has been added');
    },
    onError: () => toast.error('Failed to add version'),
  });

  const updateVersion = useMutation({
    mutationFn: async ({ id, content, authorName }: { id: string; content: string; authorName?: string }) => {
      const payload: Record<string, string> = { content };
      if (authorName) payload.author_name = authorName;
      const { error } = await supabase
        .from('script_user_versions')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script-user-versions', scriptId] });
      toast.success('Version updated');
    },
    onError: () => toast.error('Failed to update version'),
  });

  const deleteVersion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('script_user_versions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script-user-versions', scriptId] });
      toast.success('Version deleted');
    },
    onError: () => toast.error('Failed to delete version'),
  });

  return {
    userVersions,
    isLoading,
    addVersion,
    updateVersion,
    deleteVersion,
    userId: user?.id,
  };
}
