import { scheduleAfterLoad } from "@/lib/idle";

/**
 * Warm the network/cache for the most frequently-navigated learner routes
 * once the browser is idle. The dynamic `import()` calls fire the same chunk
 * fetch React.lazy will use later, so when the user actually navigates the
 * module is already parsed — no Suspense flash.
 *
 * Kept intentionally small: only routes that ~every session visits. Heavy
 * admin/editor chunks stay on-demand so we don't waste bandwidth for learners.
 */
export function prefetchCommonRoutes(): void {
  // First wave (3s, then idle): the routes ~every learner visits.
  scheduleAfterLoad(3000, () => {
    void import("@/pages/learning-track/PreRnf");
    void import("@/pages/learning-track/First60Days");
    void import("@/pages/learning-track/First14Days");
    void import("@/pages/learning-track/LearningTrackIndex");
    void import("@/pages/MyAccount");
  });

  // Second wave (8s, then idle): commonly visited but not on the critical path.
  // Spread further out so we never compete with the user's first interaction.
  scheduleAfterLoad(8000, () => {
    void import("@/pages/Leaderboard");
    void import("@/pages/Library");
    void import("@/pages/Categories");
    void import("@/pages/CMFASExams");
    void import("@/pages/Bookmarks");
  });
}
