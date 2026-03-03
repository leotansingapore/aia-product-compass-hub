import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';

export interface PlaybookPref {
  id: string;
  user_id: string;
  playbook_id: string;
  is_favourite: boolean;
  is_hidden: boolean;
}

export function usePlaybookPrefs() {
  const { user } = useSimplifiedAuth();
  const queryClient = useQueryClient();

  const { data: prefs = [] } = useQuery({
    queryKey: ['playbook-prefs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('playbook_user_prefs' as any)
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return (data || []) as PlaybookPref[];
    },
    enabled: !!user,
  });

  const getPref = (playbookId: string) =>
    prefs.find(p => p.playbook_id === playbookId);

  const isFavourite = (playbookId: string) => getPref(playbookId)?.is_favourite ?? false;
  const isHidden = (playbookId: string) => getPref(playbookId)?.is_hidden ?? false;

  const upsertPref = useMutation({
    mutationFn: async ({ playbookId, patch }: { playbookId: string; patch: Partial<Pick<PlaybookPref, 'is_favourite' | 'is_hidden'>> }) => {
      if (!user) throw new Error('Not authenticated');
      const existing = getPref(playbookId);
      if (existing) {
        const { error } = await supabase
          .from('playbook_user_prefs' as any)
          .update({ ...patch, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('playbook_user_prefs' as any)
          .insert({ user_id: user.id, playbook_id: playbookId, ...patch });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playbook-prefs', user?.id] });
    },
  });

  const toggleFavourite = (playbookId: string) =>
    upsertPref.mutate({ playbookId, patch: { is_favourite: !isFavourite(playbookId) } });

  const toggleHidden = (playbookId: string) =>
    upsertPref.mutate({ playbookId, patch: { is_hidden: !isHidden(playbookId) } });

  return { prefs, isFavourite, isHidden, toggleFavourite, toggleHidden };
}
