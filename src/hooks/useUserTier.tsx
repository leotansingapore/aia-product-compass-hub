import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useViewMode } from '@/components/admin/AdminViewSwitcher';
import { DEFAULT_TIER, normalizeTier, TIER_META, type TierLevel } from '@/lib/tiers';

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
  const { viewAsTier } = useViewMode();

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
    // 15 min — tier rarely changes mid-session, and the realtime channel
    // below invalidates this query immediately on any update.
    staleTime: 15 * 60_000,
    gcTime: 30 * 60_000,
  });

  // Realtime: when the admin flips this user's tier (approve flow, manual
  // TierControl), Supabase pushes the row change and we invalidate + toast.
  // Keeps a ref to the previous tier so we can celebrate only on real upgrades.
  const previousTierRef = useRef<TierLevel | undefined>(undefined);
  useEffect(() => {
    if (query.data !== undefined) previousTierRef.current = query.data;
  }, [query.data]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`user-tier-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_access_tiers',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newRow = payload.new as { tier_level?: string } | null;
          const nextTier = normalizeTier(newRow?.tier_level);
          const previousTier = previousTierRef.current;
          queryClient.invalidateQueries({ queryKey: userTierQueryKey(user.id) });

          // Celebrate only when it's a true upgrade (rank went up) vs. a
          // cosmetic delete/insert round-trip on the same tier.
          if (
            previousTier &&
            previousTier !== nextTier &&
            TIER_META[nextTier].rank > TIER_META[previousTier].rank
          ) {
            const meta = TIER_META[nextTier];
            toast({
              title: `🎉 You're now ${meta.label}`,
              description: meta.description,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const effectiveTier: TierLevel = viewAsTier ?? query.data ?? DEFAULT_TIER;

  // The tier is UNKNOWN (not "explorer") when the lookup failed and we never
  // got a row. Callers must not treat `tier` as the user's real tier in that
  // case — silently falling back to Explorer used to lock a Post-RNF user out
  // of every route with a "This section is locked" toast.
  const isError = viewAsTier === null && query.isError && query.data === undefined;

  return {
    tier: effectiveTier,
    isLoading: query.isLoading,
    /** True when the tier lookup failed — `tier` is a fallback, not the truth. */
    isError,
    error: query.error,
    refetch: () => query.refetch(),
  };
}
