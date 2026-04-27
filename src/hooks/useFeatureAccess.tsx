import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserTier } from '@/hooks/useUserTier';
import { usePermissions } from '@/hooks/usePermissions';
import { useViewMode } from '@/components/admin/AdminViewSwitcher';
import { FEATURES, TIER_FEATURE_MATRIX, type FeatureKey, type TierLevel } from '@/lib/tiers';

export const tierPermissionsQueryKey = ['tier-permissions'] as const;

interface TierPermissionRow {
  tier_level: string;
  resource_id: string;
}

/**
 * Returns `{can, canAny, tier, isAdminBypass}` for gating features by tier.
 *
 * - `can(featureKey)` — `true` if the current user's tier includes the feature
 *   OR if the user is an admin / master_admin (they always bypass).
 * - `canAny(featureKeys)` — `true` if any of the listed features are allowed.
 * - `tier` — the user's current tier (from useUserTier).
 * - `isAdminBypass` — whether admin role is causing the bypass (useful for
 *   rendering a visual hint like "Admin view — this would be hidden for a
 *   regular user"). Until `permissionsLoading` is false, this may be false even
 *   for admins — do not redirect on tier until permissions resolve.
 * - `permissionsLoading` — while true, `get_user_admin_role` has not returned;
 *   RequireTier waits before evaluating access.
 *
 * The hook pulls `tier_permissions` from Supabase but falls back to the static
 * `TIER_FEATURE_MATRIX` if the DB query hasn't loaded / fails — so gating is
 * never accidentally permissive during app startup.
 */
export function useFeatureAccess() {
  const { tier, isLoading: tierLoading } = useUserTier();
  const { hasRole, isMasterAdmin, loading: permissionsLoading } = usePermissions();
  const { viewAsTier } = useViewMode();
  // Admin bypass is suppressed while impersonating a tier so gating reflects
  // what a real user with that tier would see.
  const isAdminBypass = (isMasterAdmin() || hasRole('admin')) && viewAsTier === null;

  const { data: rows } = useQuery<TierPermissionRow[]>({
    queryKey: tierPermissionsQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tier_permissions')
        .select('tier_level, resource_id');
      if (error) throw error;
      return (data ?? []) as TierPermissionRow[];
    },
    staleTime: 5 * 60_000,
  });

  // Build tier → Set<featureKey> lookup. Static `TIER_FEATURE_MATRIX` is
  // always the floor (Explorer ⊂ Papers-taker ⊂ Post-RNF). `tier_permissions`
  // rows are **unioned** on top so the DB can grant extra `resource_id`s
  // without ever stripping a feature that the static matrix guarantees.
  const permissionsByTier = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const [t, features] of Object.entries(TIER_FEATURE_MATRIX)) {
      const set = new Set<string>(features);
      if (rows) {
        for (const row of rows) {
          if (row.tier_level === t) set.add(row.resource_id);
        }
      }
      map.set(t, set);
    }
    return map;
  }, [rows]);

  const can = useCallback(
    (featureKey: FeatureKey): boolean => {
      if (isAdminBypass) return true;
      // Hard exclusions: Roleplay and Bookmarks are Post-RNF and Papers-taker
      // features respectively — Explorer cannot get bookmarks; Papers-taker
      // cannot get roleplay (Post-RNF-only). Mirrors static matrix, applied
      // here so stale DB rows cannot widen access beyond tier intent.
      if (tier === 'explorer' && featureKey === FEATURES.BOOKMARKS) return false;
      if (tier === 'papers_taker' && featureKey === FEATURES.ROLEPLAY) return false;
      return permissionsByTier.get(tier)?.has(featureKey) ?? false;
    },
    [permissionsByTier, tier, isAdminBypass],
  );

  const canAny = useCallback(
    (featureKeys: readonly FeatureKey[]): boolean => {
      if (isAdminBypass) return true;
      const allowed = permissionsByTier.get(tier);
      if (!allowed) return false;
      return featureKeys.some((key) => {
        if (tier === 'explorer' && key === FEATURES.BOOKMARKS) return false;
        if (tier === 'papers_taker' && key === FEATURES.ROLEPLAY) return false;
        return allowed.has(key);
      });
    },
    [permissionsByTier, tier, isAdminBypass],
  );

  return {
    can,
    canAny,
    tier: tier as TierLevel,
    isAdminBypass,
    /** True while `get_user_admin_role` is in flight — tier route guards must wait (see RequireTier). */
    permissionsLoading,
  };
}
