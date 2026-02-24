import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ScriptVersion } from '@/hooks/useScripts';

export interface ScriptVersionHistoryEntry {
  id: string;
  script_id: string;
  versions: ScriptVersion[];
  edited_by: string;
  editor_name: string;
  edit_summary: string | null;
  created_at: string;
}

export function useScriptVersionHistory(scriptId: string | null) {
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['script-version-history', scriptId],
    queryFn: async () => {
      if (!scriptId) return [];
      const { data, error } = await supabase
        .from('script_version_history' as any)
        .select('*')
        .eq('script_id', scriptId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        versions: (d.versions as unknown as ScriptVersion[]) || [],
      })) as ScriptVersionHistoryEntry[];
    },
    enabled: !!scriptId,
  });

  const saveSnapshot = useMutation({
    mutationFn: async ({
      scriptId,
      versions,
      editedBy,
      editorName,
      editSummary,
    }: {
      scriptId: string;
      versions: ScriptVersion[];
      editedBy: string;
      editorName: string;
      editSummary?: string;
    }) => {
      const { error } = await supabase
        .from('script_version_history' as any)
        .insert({
          script_id: scriptId,
          versions: JSON.parse(JSON.stringify(versions)),
          edited_by: editedBy,
          editor_name: editorName,
          edit_summary: editSummary || null,
        } as any);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['script-version-history', vars.scriptId] });
    },
  });

  return { history, isLoading, saveSnapshot };
}
