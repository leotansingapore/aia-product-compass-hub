import { FEATURES, type FeatureKey } from "@/lib/tiers";

/**
 * Every navigable destination in the hub, with the synonyms people actually
 * type. Feature gating mirrors the route guards in App.tsx: `features` is
 * any-of (same as TopNav/AppSidebar), `adminOnly` mirrors ProtectedAdminPage.
 * No `features` = available to every signed-in user.
 */
export interface PageEntry {
  title: string;
  href: string;
  meta: string;
  keywords: string[];
  features?: readonly FeatureKey[];
  adminOnly?: boolean;
}

export const PAGE_ENTRIES: PageEntry[] = [
  { title: "Dashboard", href: "/", meta: "Home", keywords: ["home", "start", "main"] },
  {
    title: "My Learning",
    href: "/learning-track",
    meta: "Learning tracks hub",
    keywords: ["learning track", "curriculum", "course", "training"],
    features: [FEATURES.EXPLORER_TRACK, FEATURES.PRE_RNF_TRACK, FEATURES.POST_RNF_TRACK],
  },
  {
    title: "First 14 Days",
    href: "/learning-track/first-14-days",
    meta: "Explorer track",
    keywords: ["explorer", "orientation", "start here"],
    features: [FEATURES.EXPLORER_TRACK],
  },
  {
    title: "First 60 Days",
    href: "/learning-track/first-60-days",
    meta: "Pre-RNF curriculum — 10 weeks",
    keywords: ["curriculum", "lessons", "pre-rnf", "60 days"],
    features: [FEATURES.PRE_RNF_TRACK],
  },
  {
    title: "Assignments",
    href: "/learning-track/pre-rnf/assignments",
    meta: "Pre-RNF assignments",
    keywords: ["homework", "submissions", "deliverables", "tasks"],
    features: [FEATURES.PRE_RNF_TRACK],
  },
  {
    title: "Worksheets",
    href: "/learning-track/pre-rnf/worksheets",
    meta: "Business plan & worksheet builder",
    keywords: ["business plan", "worksheet builder", "pledge", "pdf"],
    features: [FEATURES.PRE_RNF_TRACK],
  },
  {
    title: "Product Mastery",
    href: "/learning-track/product-mastery",
    meta: "7 products in 7 weeks",
    keywords: ["products", "product mastery track", "product training"],
    features: [FEATURES.PRE_RNF_TRACK],
  },
  {
    title: "Next 60 Days",
    href: "/learning-track/next-60-days",
    meta: "Post-RNF curriculum",
    keywords: ["post-rnf", "next 60", "advanced"],
    features: [FEATURES.POST_RNF_TRACK],
  },
  {
    title: "Resources",
    href: "/learning-track/resources",
    meta: "Learning track resources",
    keywords: ["reference", "materials", "downloads"],
    features: [FEATURES.PRE_RNF_TRACK],
  },
  {
    title: "Competitor Products Reference",
    href: "/learning-track/resources/competitor-products",
    meta: "Singapore competitor plans",
    keywords: ["competitors", "other insurers", "comparison", "prudential", "great eastern"],
    features: [FEATURES.PRE_RNF_TRACK],
  },
  { title: "Leaderboard", href: "/leaderboard", meta: "Cohort points & rankings", keywords: ["points", "ranking", "score", "cohort"] },
  {
    title: "Library",
    href: "/library",
    meta: "Products, question banks, cheat sheets, tools",
    keywords: ["browse", "catalog", "everything"],
  },
  {
    title: "Cheat Sheets",
    href: "/library/cheat-sheets",
    meta: "One-page summaries",
    keywords: ["summary", "quick reference", "crib sheet", "revision"],
  },
  {
    title: "Products Library",
    href: "/library/products",
    meta: "All product pages",
    keywords: ["product list", "plans", "insurance products"],
    features: [FEATURES.PRODUCTS],
  },
  {
    title: "Question Banks",
    href: "/question-banks",
    meta: "Study & exam practice dashboard",
    keywords: ["quiz", "questions", "practice", "mcq", "study bank", "exam bank"],
    features: [FEATURES.QUESTION_BANKS],
  },
  {
    title: "Review Bank",
    href: "/review-bank",
    meta: "Questions you got wrong",
    keywords: ["mistakes", "wrong answers", "revision", "review"],
    features: [FEATURES.QUESTION_BANKS],
  },
  {
    title: "Browse All Questions",
    href: "/review-all",
    meta: "Every question with answers — searchable & printable",
    keywords: ["all questions", "print", "pdf", "answers"],
    features: [FEATURES.QUESTION_BANKS],
  },
  {
    title: "Tools",
    href: "/library/tools",
    meta: "Content studio & generators",
    keywords: ["content studio", "generators", "utilities"],
  },
  {
    title: "Sales Scripts",
    href: "/scripts",
    meta: "Scripts database",
    keywords: ["script", "opener", "whatsapp", "call", "appointment", "prospecting"],
    features: [FEATURES.SCRIPTS],
  },
  {
    title: "Scripts Fundamentals Course",
    href: "/scripts/course",
    meta: "12-lesson mini course",
    keywords: ["scripts course", "fundamentals", "tips"],
    features: [FEATURES.SCRIPTS],
  },
  {
    title: "Objection Scripts & FAQ",
    href: "/objections",
    meta: "Objection handling",
    keywords: ["objection", "rebuttals", "faq", "pushback", "no money", "think about it"],
    features: [FEATURES.OBJECTIONS],
  },
  {
    title: "Servicing Scripts",
    href: "/servicing",
    meta: "Client servicing",
    keywords: ["servicing", "claims", "policy service", "existing clients"],
    features: [FEATURES.SERVICING],
  },
  {
    title: "Sales Playbooks",
    href: "/library/playbooks",
    meta: "Playbooks hub",
    keywords: ["playbook hub", "sales resources"],
    features: [FEATURES.SALES_PLAYBOOKS, FEATURES.PLAYBOOKS, FEATURES.SCRIPTS],
  },
  {
    title: "My Playbooks",
    href: "/playbooks",
    meta: "Personal script playbooks",
    keywords: ["my playbooks", "collections", "saved scripts"],
    features: [FEATURES.PLAYBOOKS],
  },
  {
    title: "Script Flows",
    href: "/flows",
    meta: "Conversation flow builder",
    keywords: ["flow", "conversation tree", "decision tree"],
    features: [FEATURES.FLOWS],
  },
  {
    title: "Appointment Flows",
    href: "/appointment-flows",
    meta: "Appointment conversation flows",
    keywords: ["appointment", "booking flow"],
    features: [FEATURES.FLOWS],
  },
  {
    title: "Concept Cards",
    href: "/concept-cards",
    meta: "Visual selling concepts",
    keywords: ["concepts", "visuals", "drawings", "napkin"],
    features: [FEATURES.CONCEPT_CARDS],
  },
  {
    title: "Drawings Playbook",
    href: "/drawings-playbook",
    meta: "Concept drawings, step by step",
    keywords: ["draw", "sketch", "whiteboard", "practice drawing"],
    features: [FEATURES.CONCEPT_CARDS],
  },
  {
    title: "Case Vault",
    href: "/case-vault",
    meta: "Real client case studies",
    keywords: ["cases", "case study", "client stories", "examples"],
    features: [FEATURES.CASE_VAULT],
  },
  {
    title: "Roleplay",
    href: "/roleplay",
    meta: "AI video roleplay practice",
    keywords: ["practice", "avatar", "pitch practice", "tavus", "video"],
    features: [FEATURES.ROLEPLAY],
  },
  {
    title: "Pitch Analysis",
    href: "/roleplay?tab=pitch-analysis",
    meta: "Upload & score a pitch video",
    keywords: ["pitch", "video analysis", "feedback"],
    features: [FEATURES.ROLEPLAY],
  },
  {
    title: "CMFAS Exams",
    href: "/cmfas-exams",
    meta: "M9, M9A, HI, RES5 exam prep",
    keywords: ["cmfas", "exam", "m9", "m9a", "hi", "res5", "paper", "license"],
    features: [FEATURES.CMFAS],
  },
  {
    title: "Bookmarks",
    href: "/bookmarks",
    meta: "Your saved products",
    keywords: ["saved", "favourites", "favorites"],
    features: [FEATURES.BOOKMARKS],
  },
  {
    title: "My Account",
    href: "/my-account",
    meta: "Profile & settings",
    keywords: ["profile", "settings", "password", "account"],
  },
  { title: "What's New", href: "/changelog", meta: "Changelog", keywords: ["changelog", "updates", "new features", "releases"] },
  {
    title: "How To Use",
    href: "/consultant-landing",
    meta: "Platform guide",
    keywords: ["guide", "help", "getting started", "onboarding"],
    features: [FEATURES.CONSULTANT_LANDING],
  },
  // Admin
  { title: "Admin Dashboard", href: "/admin", meta: "Admin", keywords: ["admin", "users", "manage"], adminOnly: true },
  {
    title: "Learning Track Admin",
    href: "/learning-track/admin",
    meta: "Roster, submissions, question banks",
    keywords: ["admin", "roster", "submissions", "heatmap"],
    adminOnly: true,
  },
  { title: "Manage CMFAS", href: "/cmfas-exams/manage", meta: "CMFAS lesson editor", keywords: ["admin", "cmfas manage", "videos"], adminOnly: true },
  { title: "Assign Drawings", href: "/admin/assign-drawings", meta: "Drawing assignments", keywords: ["admin", "drawings"], adminOnly: true },
];

/** The 7 Product Mastery study/exam surfaces (question-banks gated). */
export const PRODUCT_STUDY_PAGES: { slug: string; title: string }[] = [
  { slug: "pro-achiever", title: "Pro Achiever 3.0" },
  { slug: "platinum-wealth-venture", title: "Platinum Wealth Venture" },
  { slug: "healthshield-gold-max", title: "HealthShield Gold Max" },
  { slug: "pro-lifetime-protector", title: "Pro Lifetime Protector" },
  { slug: "solitaire-pa", title: "Solitaire Personal Accident" },
  { slug: "ultimate-critical-cover", title: "Ultimate Critical Cover" },
  { slug: "guaranteed-protect-plus", title: "Guaranteed Protect Plus" },
];
