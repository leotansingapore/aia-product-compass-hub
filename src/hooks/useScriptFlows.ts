import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { toast } from 'sonner';

export interface FlowNode {
  id: string;
  scriptId: string | null;
  label: string;
  type: 'start' | 'script' | 'decision' | 'action' | 'end';
  x: number;
  y: number;
  customText?: string;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  condition?: 'yes' | 'no' | 'no-reply' | 'custom';
}

export interface ScriptFlow {
  id: string;
  title: string;
  description: string | null;
  created_by: string;
  is_template: boolean;
  template_category: string | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  created_at: string;
  updated_at: string;
}

export function useScriptFlows() {
  const { user } = useSimplifiedAuth();
  const queryClient = useQueryClient();

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ['script-flows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('script_flows')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(d => ({
        ...d,
        nodes: (d.nodes as unknown as FlowNode[]) || [],
        edges: (d.edges as unknown as FlowEdge[]) || [],
      })) as ScriptFlow[];
    },
  });

  const createFlow = useMutation({
    mutationFn: async (flow: { title: string; description?: string; nodes: FlowNode[]; edges: FlowEdge[]; is_template?: boolean; template_category?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('script_flows')
        .insert({
          title: flow.title,
          description: flow.description || null,
          created_by: user.id,
          nodes: JSON.parse(JSON.stringify(flow.nodes)),
          edges: JSON.parse(JSON.stringify(flow.edges)),
          is_template: flow.is_template || false,
          template_category: flow.template_category || null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script-flows'] });
      toast.success('Flow created');
    },
    onError: () => toast.error('Failed to create flow'),
  });

  const updateFlow = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; description?: string; nodes?: FlowNode[]; edges?: FlowEdge[] }) => {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.nodes !== undefined) payload.nodes = JSON.parse(JSON.stringify(updates.nodes));
      if (updates.edges !== undefined) payload.edges = JSON.parse(JSON.stringify(updates.edges));
      const { error } = await supabase.from('script_flows').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script-flows'] });
      toast.success('Flow saved');
    },
    onError: () => toast.error('Failed to save flow'),
  });

  const deleteFlow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('script_flows').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['script-flows'] });
      toast.success('Flow deleted');
    },
    onError: () => toast.error('Failed to delete flow'),
  });

  return { flows, isLoading, createFlow, updateFlow, deleteFlow, userId: user?.id };
}
