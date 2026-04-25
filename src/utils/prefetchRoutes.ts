import { scheduleIdle } from "@/lib/idle";

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
  scheduleIdle(() => {
    // Fire-and-forget — failures are silently ignored (offline, stale chunk,
    // etc.). The real navigation will surface any genuine error.
    void import("@/pages/learning-track/PreRnf");
    void import("@/pages/learning-track/First60Days");
    void import("@/pages/learning-track/First14Days");
    void import("@/pages/learning-track/LearningTrackIndex");
    void import("@/pages/MyAccount");
  }, 3000);
}
