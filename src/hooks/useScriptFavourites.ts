import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { toast } from 'sonner';

export function useScriptFavourites() {
  const { user } = useSimplifiedAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: favourites = [], isLoading } = useQuery({
    queryKey: ['script-favourites', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('script_favourites' as any)
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []) as unknown as { id: string; script_id: string }[];
    },
    enabled: !!userId,
  });

  const favouriteIds = new Set(favourites.map(f => f.script_id));

  const toggleFavourite = useMutation({
    mutationFn: async (scriptId: string) => {
      if (!userId) throw new Error('Not authenticated');
      const existing = favourites.find(f => f.script_id === scriptId);
      if (existing) {
        const { error } = await supabase
          .from('script_favourites' as any)
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        const { error } = await supabase
          .from('script_favourites' as any)
          .insert({ user_id: userId, script_id: scriptId });
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['script-favourites', userId] });
      toast.success(result.action === 'added' ? 'Added to favourites' : 'Removed from favourites');
    },
    onError: () => toast.error('Failed to update favourite'),
  });

  return { favouriteIds, toggleFavourite, isLoading };
}
