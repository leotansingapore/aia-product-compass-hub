/**
 * Route-level hover/intent prefetch.
 *
 * When a user hovers (or focuses, or touches) a nav link we kick off the same
 * dynamic `import()` React.lazy will use on actual navigation. By the time
 * they click, the chunk is parsed and the page renders without a Suspense
 * fallback flash.
 *
 * Each loader is fired at most once per session — duplicate calls are no-ops
 * because the module is already in the loader cache.
 *
 * Keep this map in sync with the lazy() declarations in App.tsx for the
 * highest-traffic routes. We intentionally skip rare admin/editor chunks so
 * the network stays quiet for the common case.
 */

type Loader = () => Promise<unknown>;

const loaders: Record<string, Loader> = {
  "/": () => import("@/pages/Index"),
  "/learning-track": () => import("@/pages/learning-track/LearningTrackIndex"),
  "/learning-track/pre-rnf": () => import("@/pages/learning-track/PreRnf"),
  "/learning-track/post-rnf": () => import("@/pages/learning-track/PostRnf"),
  "/learning-track/first-60-days": () => import("@/pages/learning-track/First60Days"),
  "/learning-track/first-14-days": () => import("@/pages/learning-track/First14Days"),
  "/learning-track/next-60-days": () => import("@/pages/learning-track/Next60Days"),
  "/learning-track/resources": () => import("@/pages/learning-track/Resources"),
  "/leaderboard": () => import("@/pages/Leaderboard"),
  "/library": () => import("@/pages/Library"),
  "/categories": () => import("@/pages/Categories"),
  "/cmfas-exams": () => import("@/pages/CMFASExams"),
  "/roleplay": () => import("@/pages/Roleplay"),
  "/scripts": () => import("@/pages/ScriptsDatabase"),
  "/playbooks": () => import("@/pages/Playbooks"),
  "/servicing": () => import("@/pages/ServicingPage"),
  "/concept-cards": () => import("@/pages/ConceptCards"),
  "/question-banks": () => import("@/pages/QuestionBanks"),
  "/bookmarks": () => import("@/pages/Bookmarks"),
  "/my-account": () => import("@/pages/MyAccount"),
  "/changelog": () => import("@/pages/Changelog"),
  "/how-to-use": () => import("@/pages/ConsultantLanding"),
};

const fired = new Set<string>();

/**
 * Trigger the route chunk for `path`. Safe to call repeatedly — the first
 * call wins and subsequent calls are no-ops.
 *
 * Also matches a couple of dynamic prefixes (e.g. `/product/foo` → ProductDetail)
 * so hovering a product card warms the right chunk.
 */
export function prefetchRoute(path: string): void {
  if (!path || fired.has(path)) return;
  let loader = loaders[path];

  if (!loader) {
    if (path.startsWith("/product/")) {
      loader = () => import("@/pages/ProductDetail");
    } else if (path.startsWith("/category/")) {
      loader = () => import("@/pages/ProductCategory");
    } else if (path.startsWith("/playbook/")) {
      loader = () => import("@/pages/PlaybookDetail");
    } else if (path.startsWith("/cmfas/module/")) {
      loader = () => import("@/pages/cmfas/CMFASModuleDetail");
    } else if (path.startsWith("/learning-track/admin")) {
      loader = () => import("@/pages/learning-track/admin/AdminLayout");
    }
  }

  if (!loader) return;
  fired.add(path);
  // Fire-and-forget. Network failures will resurface on real navigation.
  void loader().catch(() => fired.delete(path));
}

/** React event handlers wired onto nav links to trigger hover/focus prefetch. */
export function prefetchHandlers(path: string) {
  return {
    onMouseEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  };
}
