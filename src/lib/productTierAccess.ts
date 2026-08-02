/**
 * Per-product tier visibility.
 *
 * `products.visible_tiers` is an optional allow-list of `tier_permissions.tier_level`
 * values. `null` / `undefined` / `[]` means "no per-product restriction" — the product
 * is visible to anyone who already has access to the parent category. When populated,
 * only the listed tiers may see it. Real admins (not tier-impersonating) always bypass.
 *
 * NOTE: this is a CLIENT-side gate only. It hides the product from the category grid
 * and blocks the product/video detail routes, but the rows are still readable through
 * PostgREST by anyone who can query `products`. Enforcing this server-side needs an RLS
 * policy on `products` that filters on `visible_tiers` against the caller's tier.
 */
export function passesProductTierGate(
  visibleTiers: string[] | null | undefined,
  tier: string | null | undefined,
  isAdminBypass: boolean,
): boolean {
  if (isAdminBypass) return true;
  if (!Array.isArray(visibleTiers) || visibleTiers.length === 0) return true;
  if (!tier) return false;
  return visibleTiers.includes(tier);
}
