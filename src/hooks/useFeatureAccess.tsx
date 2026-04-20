import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserTier } from '@/hooks/useUserTier';
import { usePermissions } from '@/hooks/usePermissions';
import { useViewMode } from '@/components/admin/AdminViewSwitcher';
import { TIER_FEATURE_MATRIX, type FeatureKey, type TierLevel } from '@/lib/tiers';

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
  const { tier } = useUserTier();
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

  // Build tier → Set<featureKey> lookup. DB rows win per tier when present,
  // but we always start from the static `TIER_FEATURE_MATRIX` so a partially
  // seeded (or legacy-valued) `tier_permissions` table can't accidentally
  // lock users out. If the DB only has rows for 'explorer' and 'level_1',
  // 'papers_taker' and 'post_rnf' still get their full static feature set.
  const permissionsByTier = useMemo(() => {
    const map = new Map<string, Set<string>>();
    // Seed every known tier from the static matrix first.
    for (const [t, features] of Object.entries(TIER_FEATURE_MATRIX)) {
      map.set(t, new Set(features));
    }
    // DB rows: for any tier that appears in rows, clear the static set and
    // rebuild it from the DB (so DB is authoritative when seeded). Tiers
    // absent from rows keep their static fallback.
    if (rows && rows.length > 0) {
      const tiersInRows = new Set(rows.map((r) => r.tier_level));
      for (const t of tiersInRows) {
        map.set(t, new Set());
      }
      for (const row of rows) {
        map.get(row.tier_level)!.add(row.resource_id);
      }
    }
    return map;
  }, [rows]);

  const can = useCallback(
    (featureKey: FeatureKey): boolean => {
      if (isAdminBypass) return true;
      return permissionsByTier.get(tier)?.has(featureKey) ?? false;
    },
    [permissionsByTier, tier, isAdminBypass],
  );

  const canAny = useCallback(
    (featureKeys: readonly FeatureKey[]): boolean => {
      if (isAdminBypass) return true;
      const allowed = permissionsByTier.get(tier);
      if (!allowed) return false;
      return featureKeys.some((key) => allowed.has(key));
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
