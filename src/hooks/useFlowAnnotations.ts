import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { toast } from 'sonner';

export interface FlowAnnotation {
  id: string;
  flow_id: string;
  user_id: string;
  type: 'sticky' | 'text' | 'comment' | 'drawing';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string | null;
  color: string;
  drawing_paths: { d: string; color: string; width: number }[] | null;
  parent_id: string | null;
  resolved: boolean;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export function useFlowAnnotations(flowId: string | null) {
  const auth = useSimplifiedAuth();
  const user = (auth as any).user ?? null;
  const qc = useQueryClient();

  const { data: annotations = [], isLoading } = useQuery({
    queryKey: ['flow-annotations', flowId],
    queryFn: async () => {
      if (!flowId) return [];
      const { data, error } = await supabase
        .from('flow_annotations')
        .select('*')
        .eq('flow_id', flowId)
        .is('parent_id', null) // top-level only; replies fetched separately
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as FlowAnnotation[];
    },
    enabled: !!flowId,
  });

  const { data: replies = [] } = useQuery({
    queryKey: ['flow-annotation-replies', flowId],
    queryFn: async () => {
      if (!flowId) return [];
      const { data, error } = await supabase
        .from('flow_annotations')
        .select('*')
        .eq('flow_id', flowId)
        .not('parent_id', 'is', null)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as FlowAnnotation[];
    },
    enabled: !!flowId,
  });

  const addAnnotation = useMutation({
    mutationFn: async (payload: Omit<FlowAnnotation, 'id' | 'flow_id' | 'user_id' | 'author_name' | 'created_at' | 'updated_at'>) => {
      if (!flowId || !user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('flow_annotations')
        .insert({
          ...payload,
          flow_id: flowId,
          user_id: user.id,
          author_name: user.user_metadata?.display_name || user.user_metadata?.first_name || user.email?.split('@')[0] || 'Anonymous',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flow-annotations', flowId] });
      qc.invalidateQueries({ queryKey: ['flow-annotation-replies', flowId] });
    },
    onError: () => toast.error('Failed to add annotation'),
  });

  const updateAnnotation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FlowAnnotation> & { id: string }) => {
      const { error } = await supabase
        .from('flow_annotations')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flow-annotations', flowId] });
      qc.invalidateQueries({ queryKey: ['flow-annotation-replies', flowId] });
    },
  });

  const deleteAnnotation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('flow_annotations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flow-annotations', flowId] });
      qc.invalidateQueries({ queryKey: ['flow-annotation-replies', flowId] });
    },
    onError: () => toast.error('Failed to delete annotation'),
  });

  const repliesFor = (annotationId: string) =>
    replies.filter(r => r.parent_id === annotationId);

  return {
    annotations,
    replies,
    repliesFor,
    isLoading,
    addAnnotation: addAnnotation.mutateAsync,
    updateAnnotation: updateAnnotation.mutateAsync,
    deleteAnnotation: deleteAnnotation.mutateAsync,
    currentUserId: user?.id,
  };
}
