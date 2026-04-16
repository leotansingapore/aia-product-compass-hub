import { FEATURES, type FeatureKey } from '@/lib/tiers';

/**
 * Maps a sidebar / nav `sectionId` to the feature keys required to see it.
 * If ANY of the listed features is accessible (see `useFeatureAccess.canAny`),
 * the nav item stays visible. This lets a single nav entry like "Learning
 * Track" stay available for Explorer (`explorer-track`), Papers
 * (`pre-rnf-track`), or Post-RNF (`post-rnf-track`) users.
 *
 * Nav items not listed here have no tier requirement.
 */
export const NAV_SECTION_FEATURES: Record<string, readonly FeatureKey[]> = {
  'learning-track': [FEATURES.EXPLORER_TRACK, FEATURES.PRE_RNF_TRACK, FEATURES.POST_RNF_TRACK],
  'question-banks': [FEATURES.QUESTION_BANKS],
  bookmarks: [FEATURES.BOOKMARKS],
  'cmfas-exams': [FEATURES.CMFAS],
  roleplay: [FEATURES.ROLEPLAY],
  categories: [FEATURES.PRODUCTS],
  'sales-playbooks': [FEATURES.PLAYBOOKS, FEATURES.SCRIPTS],
  'my-account': [FEATURES.MY_ACCOUNT],
};

/**
 * Look up the features required for a nav section.
 * Returns `null` if the section has no tier requirement (always visible).
 */
export function featuresForNavSection(sectionId: string | undefined | null): readonly FeatureKey[] | null {
  if (!sectionId) return null;
  return NAV_SECTION_FEATURES[sectionId] ?? null;
}
