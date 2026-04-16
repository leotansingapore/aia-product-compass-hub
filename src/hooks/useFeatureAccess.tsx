import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserTier } from '@/hooks/useUserTier';
import { usePermissions } from '@/hooks/usePermissions';
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
 *   regular user").
 *
 * The hook pulls `tier_permissions` from Supabase but falls back to the static
 * `TIER_FEATURE_MATRIX` if the DB query hasn't loaded / fails — so gating is
 * never accidentally permissive during app startup.
 */
export function useFeatureAccess() {
  const { tier } = useUserTier();
  const { hasRole, isMasterAdmin } = usePermissions();
  const isAdminBypass = isMasterAdmin() || hasRole('admin');

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

  // Build tier → Set<featureKey> lookup. Uses the DB rows if available,
  // otherwise falls back to the static matrix. This keeps the UI functional
  // during initial load and if the DB is temporarily unreachable.
  const permissionsByTier = useMemo(() => {
    const map = new Map<string, Set<string>>();
    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (!map.has(row.tier_level)) map.set(row.tier_level, new Set());
        map.get(row.tier_level)!.add(row.resource_id);
      }
    } else {
      for (const [t, features] of Object.entries(TIER_FEATURE_MATRIX)) {
        map.set(t, new Set(features));
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

  return { can, canAny, tier: tier as TierLevel, isAdminBypass };
}
