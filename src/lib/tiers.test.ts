import { describe, it, expect } from "vitest";
import { FEATURES, TIER_FEATURE_MATRIX, type TierLevel } from "./tiers";

/**
 * Guards the owner decision taken 2026-08-02: roleplay bills per session through
 * Tavus, so it must be grantable ONLY by the static matrix below — never by a
 * `tier_permissions` row. If someone adds roleplay to a cheaper tier here, that
 * is a real (expensive) product change and this test should make them say so.
 *
 * The runtime half of the guard lives in useFeatureAccess.tsx
 * (`MATRIX_ONLY_FEATURES`), which skips DB rows for these keys.
 */
describe("tier matrix — paid features", () => {
  const tiersWithRoleplay = (Object.keys(TIER_FEATURE_MATRIX) as TierLevel[]).filter((tier) =>
    (TIER_FEATURE_MATRIX[tier] as readonly string[]).includes(FEATURES.ROLEPLAY),
  );

  it("grants Tavus roleplay to post_rnf only", () => {
    expect(tiersWithRoleplay).toEqual(["post_rnf"]);
  });

  it("does not grant roleplay to explorer or papers_taker", () => {
    expect(tiersWithRoleplay).not.toContain("explorer");
    expect(tiersWithRoleplay).not.toContain("papers_taker");
  });

  it("keeps the tier matrix cumulative — post_rnf is a superset of papers_taker", () => {
    const papers = new Set(TIER_FEATURE_MATRIX.papers_taker as readonly string[]);
    const post = new Set(TIER_FEATURE_MATRIX.post_rnf as readonly string[]);
    for (const feature of papers) expect(post.has(feature)).toBe(true);
  });

  it("keeps explorer out of the paid/authoring features it should never hold", () => {
    const explorer = new Set(TIER_FEATURE_MATRIX.explorer as readonly string[]);
    expect(explorer.has(FEATURES.ROLEPLAY)).toBe(false);
    expect(explorer.has(FEATURES.BOOKMARKS)).toBe(false);
  });
});
