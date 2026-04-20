import { Compass, GraduationCap, Building2, type LucideIcon } from 'lucide-react';

/**
 * Academy persona tiers. Every user has exactly one tier stored in
 * `user_access_tiers.tier_level`. New signups default to `explorer`.
 *
 * Legacy values `level_1` / `level_2` exist in the DB from an earlier iteration;
 * they are migrated to `papers_taker` / `post_rnf` respectively in the Tier
 * Foundation Supabase migration. Use `normalizeTier()` to handle rows that
 * haven't been migrated yet (e.g. during rollout).
 */
export const TIER_LEVELS = ['explorer', 'papers_taker', 'post_rnf'] as const;

export type TierLevel = (typeof TIER_LEVELS)[number];

export const DEFAULT_TIER: TierLevel = 'explorer';

interface TierMeta {
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes for Badge/Tag backgrounds. */
  badgeClass: string;
  /** Numeric rank for "at least Papers" style comparisons. */
  rank: number;
}

export const TIER_META: Record<TierLevel, TierMeta> = {
  explorer: {
    label: 'Explorer',
    shortLabel: 'Explorer',
    description: 'Orientation & financial planning basics',
    icon: Compass,
    badgeClass:
      'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
    rank: 1,
  },
  papers_taker: {
    label: 'Papers-taker',
    shortLabel: 'Papers',
    description: 'Pre-RNF track, CMFAS, products, question banks',
    icon: GraduationCap,
    badgeClass:
      'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
    rank: 2,
  },
  post_rnf: {
    label: 'Post-RNF',
    shortLabel: 'Post-RNF',
    description: 'Licensed consultant — full access',
    icon: Building2,
    badgeClass:
      'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
    rank: 3,
  },
};

/**
 * Map raw `tier_level` strings (including legacy values) to a `TierLevel`.
 * Returns the default tier if the value is unrecognised or missing.
 */
export function normalizeTier(raw: string | null | undefined): TierLevel {
  if (!raw) return DEFAULT_TIER;
  if (raw === 'level_1') return 'papers_taker';
  if (raw === 'level_2') return 'post_rnf';
  if ((TIER_LEVELS as readonly string[]).includes(raw)) return raw as TierLevel;
  return DEFAULT_TIER;
}

export function isTierAtLeast(current: TierLevel, minimum: TierLevel): boolean {
  return TIER_META[current].rank >= TIER_META[minimum].rank;
}

/**
 * Feature keys used as `resource_id` values in the `tier_permissions` table.
 * Each key represents a coarse-grained area of the app (roughly one per
 * top-level route or nav item). A user with a given tier can access a feature
 * iff a row exists in `tier_permissions` where `tier_level = user's tier`
 * AND `resource_id = feature key`.
 *
 * Admins (`admin`, `master_admin`) bypass this check — see `useFeatureAccess`.
 */
export const FEATURES = {
  HOME: 'home',
  BOOKMARKS: 'bookmarks',
  MY_ACCOUNT: 'my-account',
  EXPLORER_TRACK: 'explorer-track',
  PRE_RNF_TRACK: 'pre-rnf-track',
  POST_RNF_TRACK: 'post-rnf-track',
  CMFAS: 'cmfas',
  PRODUCTS: 'products',
  QUESTION_BANKS: 'question-banks',
  ROLEPLAY: 'roleplay',
  KB: 'kb',
  PLAYBOOKS: 'playbooks',
  FLOWS: 'flows',
  SCRIPTS: 'scripts',
  SERVICING: 'servicing',
  CONCEPT_CARDS: 'concept-cards',
  CONSULTANT_LANDING: 'consultant-landing',
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];

/**
 * Source-of-truth feature matrix. Mirrors the rows seeded into
 * `tier_permissions` in the Phase 2 DB migration. Kept here as a fallback so
 * the UI can still gate features correctly if the DB query fails, and to
 * document intent alongside the type system.
 */
export const TIER_FEATURE_MATRIX: Record<TierLevel, readonly FeatureKey[]> = {
  explorer: [
    FEATURES.HOME,
    FEATURES.MY_ACCOUNT,
    FEATURES.EXPLORER_TRACK,
  ],
  papers_taker: [
    FEATURES.HOME,
    FEATURES.BOOKMARKS,
    FEATURES.MY_ACCOUNT,
    FEATURES.EXPLORER_TRACK,
    FEATURES.PRE_RNF_TRACK,
    FEATURES.CMFAS,
    FEATURES.PRODUCTS,
    FEATURES.QUESTION_BANKS,
    FEATURES.ROLEPLAY,
    FEATURES.KB,
  ],
  post_rnf: [
    FEATURES.HOME,
    FEATURES.BOOKMARKS,
    FEATURES.MY_ACCOUNT,
    FEATURES.EXPLORER_TRACK,
    FEATURES.PRE_RNF_TRACK,
    FEATURES.POST_RNF_TRACK,
    FEATURES.PRODUCTS,
    FEATURES.QUESTION_BANKS,
    FEATURES.ROLEPLAY,
    FEATURES.KB,
    FEATURES.PLAYBOOKS,
    FEATURES.FLOWS,
    FEATURES.SCRIPTS,
    FEATURES.SERVICING,
    FEATURES.CONCEPT_CARDS,
    FEATURES.CONSULTANT_LANDING,
  ],
};
