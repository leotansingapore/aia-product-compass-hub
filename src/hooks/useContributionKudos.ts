import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';

export function useContributionKudos(scriptId: string) {
  const { user } = useSimplifiedAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const { data: kudosMap = {} } = useQuery({
    queryKey: ['contribution-kudos', scriptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contribution_kudos' as any)
        .select('id, contribution_id, user_id');
      if (error) throw error;
      // Group by contribution_id: { contributionId: { count, userGave } }
      const map: Record<string, { count: number; userGave: boolean; userKudoId?: string }> = {};
      for (const row of (data || []) as any[]) {
        if (!map[row.contribution_id]) {
          map[row.contribution_id] = { count: 0, userGave: false };
        }
        map[row.contribution_id].count++;
        if (row.user_id === userId) {
          map[row.contribution_id].userGave = true;
          map[row.contribution_id].userKudoId = row.id;
        }
      }
      return map;
    },
  });

  const toggleKudos = useMutation({
    mutationFn: async (contributionId: string) => {
      if (!userId) throw new Error('Not authenticated');
      const entry = kudosMap[contributionId];
      if (entry?.userGave && entry.userKudoId) {
        const { error } = await supabase
          .from('contribution_kudos' as any)
          .delete()
          .eq('id', entry.userKudoId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contribution_kudos' as any)
          .insert({ user_id: userId, contribution_id: contributionId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contribution-kudos', scriptId] });
    },
  });

  return { kudosMap, toggleKudos };
}
