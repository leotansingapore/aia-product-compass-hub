// featureCatalog - the screens that report a `feature_open`, and the screens
// that deliberately do not. Ported from remix-of-activity-tracker on
// 2026-09-13; the shape and the two rules are identical.
//
// The academy is a learning track (day pages, assignments, worksheets), a
// library (products, question banks, cheat sheets, playbooks), CMFAS study
// and the sales toolkits (flows, scripts, objections, roleplay). Keys carry
// the family (lt_pre_rnf, library_products, product_study) because "who uses
// question banks" is a different answer in the library and in the track.
//
// Two rules keep it honest:
//   1. Every route in App.tsx - nested ones rebuilt to full paths - either
//      matches a FEATURE here or has a prefix in UNTRACKED with a reason.
//      featureCatalog.test.ts reads the file off disk and fails otherwise.
//   2. Keys are permanent. They join the history in app_events.
//
// Every matcher ends on a segment boundary; family index pages use `exact()`.
// UNTRACKED is consulted first and is bounded the same way.

export type FeatureArea = 'Track' | 'Library' | 'Products' | 'CMFAS' | 'Sales' | 'Community' | 'Account' | 'Shared'

export interface FeatureDef {
  /** Stable id written into app_events.props.feature. Never rename. */
  key: string
  /** What the Product panel calls it. Safe to reword. */
  label: string
  area: FeatureArea
  match: RegExp
}

const esc = (p: string) => p.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
const SEG = '[^/]+'
const at = (...prefixes: string[]): RegExp =>
  new RegExp(`^(?:${prefixes.map((p) => esc(p).replace(/:p/g, SEG)).join('|')})(?:/|$)`)
const exact = (...paths: string[]): RegExp =>
  new RegExp(`^(?:${paths.map((p) => esc(p).replace(/:p/g, SEG)).join('|')})/?$`)

const LT = '/learning-track'

export const FEATURE_CATALOG: FeatureDef[] = [
  // --- Learning track ----------------------------------------------------------
  { key: 'lt_admin', label: 'Track: admin (roster, heatmap, submissions)', area: 'Track', match: at(`${LT}/admin`) },
  { key: 'lt_home', label: 'Track: home', area: 'Track', match: exact(LT) },
  { key: 'lt_first_14_days', label: 'Track: first 14 days', area: 'Track', match: at(`${LT}/first-14-days`) },
  { key: 'lt_first_30_days', label: 'Track: first 30 days', area: 'Track', match: at(`${LT}/first-30-days`) },
  { key: 'lt_first_60_days', label: 'Track: first 60 days', area: 'Track', match: at(`${LT}/first-60-days`) },
  { key: 'lt_next_60_days', label: 'Track: next 60 days', area: 'Track', match: at(`${LT}/next-60-days`) },
  { key: 'lt_product_mastery', label: 'Track: product mastery', area: 'Track', match: at(`${LT}/product-mastery`) },
  { key: 'lt_pre_rnf_tools', label: 'Track: pre-RNF assignment tools', area: 'Track', match: new RegExp(`^${esc(`${LT}/pre-rnf/assignments/`)}${SEG}/tool(?:/|$)`) },
  { key: 'lt_pre_rnf_assignments', label: 'Track: pre-RNF assignments', area: 'Track', match: at(`${LT}/pre-rnf/assignments`) },
  { key: 'lt_pre_rnf_worksheets', label: 'Track: pre-RNF worksheets', area: 'Track', match: at(`${LT}/pre-rnf/worksheets`) },
  { key: 'lt_pre_rnf', label: 'Track: pre-RNF', area: 'Track', match: at(`${LT}/pre-rnf`) },
  { key: 'lt_post_rnf_assignments', label: 'Track: post-RNF assignments', area: 'Track', match: at(`${LT}/post-rnf/assignments`) },
  { key: 'lt_post_rnf', label: 'Track: post-RNF', area: 'Track', match: at(`${LT}/post-rnf`) },
  { key: 'lt_resources', label: 'Track: resources', area: 'Track', match: at(`${LT}/resources`) },

  // --- Library -----------------------------------------------------------------
  { key: 'library_products', label: 'Library: products', area: 'Library', match: at('/library/products') },
  { key: 'library_question_banks', label: 'Library: question banks', area: 'Library', match: at('/library/question-banks') },
  { key: 'library_cheat_sheets', label: 'Library: cheat sheets', area: 'Library', match: at('/library/cheat-sheets') },
  { key: 'library_playbooks', label: 'Library: playbooks', area: 'Library', match: at('/library/playbooks') },
  { key: 'library_tools', label: 'Library: tools', area: 'Library', match: at('/library/tools') },
  { key: 'library_home', label: 'Library: home', area: 'Library', match: exact('/library') },
  { key: 'cheat_sheets', label: 'Cheat sheet', area: 'Library', match: at('/cheat-sheets') },
  { key: 'concept_cards', label: 'Concept cards', area: 'Library', match: at('/concept-cards') },
  { key: 'question_banks', label: 'Question banks', area: 'Library', match: at('/question-banks') },
  { key: 'review_bank', label: 'Review bank', area: 'Library', match: at('/review-bank', '/review-all') },
  { key: 'categories', label: 'Categories', area: 'Library', match: at('/categories', '/category') },

  // --- Product training ----------------------------------------------------------
  { key: 'product_study', label: 'Product: study mode', area: 'Products', match: at('/product/:p/study') },
  { key: 'product_exam', label: 'Product: exam', area: 'Products', match: at('/product/:p/exam') },
  { key: 'product_ai', label: 'Product: AI assistant', area: 'Products', match: at('/product/:p/ai-assistant') },
  { key: 'product_manage_videos', label: 'Product: manage videos (admin)', area: 'Products', match: at('/product/:p/manage-videos') },
  { key: 'product', label: 'Product: lessons', area: 'Products', match: at('/product') },

  // --- CMFAS -------------------------------------------------------------------
  { key: 'cmfas_manage', label: 'CMFAS: manage (admin)', area: 'CMFAS', match: at('/cmfas-exams/manage') },
  { key: 'cmfas_exams', label: 'CMFAS: exams', area: 'CMFAS', match: at('/cmfas-exams') },
  { key: 'cmfas_module', label: 'CMFAS: module', area: 'CMFAS', match: at('/cmfas/module') },
  { key: 'cmfas_chat', label: 'CMFAS: chat', area: 'CMFAS', match: at('/cmfas/chat') },

  // --- Sales toolkit -------------------------------------------------------------
  { key: 'flows', label: 'Flows', area: 'Sales', match: at('/flows', '/appointment-flows') },
  { key: 'scripts', label: 'Scripts', area: 'Sales', match: at('/scripts', '/servicing') },
  { key: 'objections', label: 'Objections', area: 'Sales', match: at('/objections') },
  { key: 'playbooks', label: 'Playbooks', area: 'Sales', match: at('/playbooks', '/sales-playbooks', '/drawings-playbook') },
  { key: 'roleplay', label: 'Roleplay', area: 'Sales', match: at('/roleplay') },
  { key: 'content_studio', label: 'Content studio', area: 'Sales', match: at('/content-studio') },
  { key: 'case_vault', label: 'Case vault', area: 'Sales', match: at('/case-vault') },

  // --- Community and account ----------------------------------------------------------
  { key: 'leaderboard', label: 'Leaderboard', area: 'Community', match: at('/leaderboard') },
  { key: 'team_progress', label: 'Team progress', area: 'Community', match: at('/team-progress') },
  { key: 'feedback', label: 'Feedback board', area: 'Community', match: at('/feedback') },
  { key: 'roadmap', label: 'Roadmap', area: 'Community', match: at('/roadmap') },
  { key: 'bookmarks', label: 'Bookmarks', area: 'Account', match: at('/bookmarks') },
  { key: 'my_account', label: 'My account', area: 'Account', match: at('/my-account') },
  { key: 'how_to_use', label: 'How to use', area: 'Account', match: at('/how-to-use') },
  { key: 'changelog', label: 'Changelog', area: 'Account', match: at('/changelog') },
  { key: 'consultant_landing', label: 'Consultant landing', area: 'Account', match: at('/consultant-landing') },
  { key: 'home', label: 'Home', area: 'Account', match: exact('/') },
]

/** Routes that report nothing, on purpose, with the reason. */
export const UNTRACKED: { prefix: string; why: string }[] = [
  { prefix: '/admin', why: 'The developer reading this very panel' },
  { prefix: '/auth', why: 'Sign-in, not a feature' },
  { prefix: '/force-password', why: 'Sign-in, not a feature' },
  { prefix: '/reset-password', why: 'Sign-in, not a feature' },
  { prefix: '/oauth', why: 'OAuth handshake' },
  { prefix: '/tools', why: 'Redirects to the library' },
  { prefix: '/learning-track/explorer', why: 'Redirects to the first 14 days' },
  { prefix: '/playbooks/share', why: 'A public share link; viewers are usually not signed in' },
]

const byKey = new Map(FEATURE_CATALOG.map((f) => [f.key, f]))

/** Untracked prefixes are segment-bounded too, so /auth never swallows /author. */
export function isUntracked(pathname: string): boolean {
  return UNTRACKED.some((u) => at(u.prefix).test(pathname))
}

/** The feature a path belongs to, or null if it reports nothing. */
export function featureForPath(pathname: string): FeatureDef | null {
  if (isUntracked(pathname)) return null
  return FEATURE_CATALOG.find((f) => f.match.test(pathname)) ?? null
}

export function featureLabel(key: string): string {
  return byKey.get(key)?.label ?? key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

export function featureArea(key: string): FeatureArea | 'Retired' {
  return byKey.get(key)?.area ?? 'Retired'
}

export function isKnownFeature(key: string): boolean {
  return byKey.has(key)
}
