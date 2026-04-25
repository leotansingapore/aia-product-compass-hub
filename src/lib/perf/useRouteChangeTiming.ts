import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { recordRoute } from "./measure";

/**
 * Measures the wall-clock time from a route change starting (URL update) to
 * the next paint after React commits the new tree. We use a double-rAF so we
 * record after the browser has actually drawn the new pixels, not just after
 * React finishes reconciling.
 *
 * Mount this once near the root (inside <BrowserRouter>) — it's silent unless
 * the perf overlay is enabled.
 */
export function useRouteChangeTiming(): void {
  const location = useLocation();
  const lastPathRef = useRef<string | null>(null);
  const startRef = useRef<number>(performance.now());

  useEffect(() => {
    const path = location.pathname + location.search;

    // Skip the initial mount — that's covered by FCP/LCP, not route timing.
    if (lastPathRef.current === null) {
      lastPathRef.current = path;
      return;
    }
    if (lastPathRef.current === path) return;
    lastPathRef.current = path;

    startRef.current = performance.now();
    let cancelled = false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        recordRoute({
          path,
          durationMs: performance.now() - startRef.current,
          timestamp: Date.now(),
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search]);
}
