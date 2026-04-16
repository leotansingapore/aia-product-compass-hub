import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_TIER, normalizeTier, type TierLevel } from '@/lib/tiers';

/** React Query key — invalidate when any tier changes. */
export function userTierQueryKey(userId: string | undefined) {
  return ['user-tier', userId] as const;
}

/**
 * Returns the current user's Academy tier (Explorer / Papers-taker / Post-RNF).
 *
 * If no row exists in `user_access_tiers` yet (e.g. a user who pre-dates the
 * auto-assign trigger), resolves to `DEFAULT_TIER` ('explorer') without
 * creating a row — admins can backfill via the User Management UI.
 */
export function useUserTier() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: userTierQueryKey(user?.id),
    queryFn: async (): Promise<TierLevel> => {
      if (!user?.id) return DEFAULT_TIER;
      const { data, error } = await supabase
        .from('user_access_tiers')
        .select('tier_level')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return normalizeTier(data?.tier_level);
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  return {
    tier: query.data ?? DEFAULT_TIER,
    isLoading: query.isLoading,
    error: query.error,
    refetch: () => queryClient.invalidateQueries({ queryKey: userTierQueryKey(user?.id) }),
  };
}
