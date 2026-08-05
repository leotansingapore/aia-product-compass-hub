import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the `#hash` anchor once async-rendered content is on screen.
 * Used by the four curriculum day pages so deep links from global search
 * ("Inside lessons" hits), Case Vault and shared URLs land on the section.
 *
 * Two quirks this handles:
 * - Rendering can settle a few frames after the `ready` flag flips, so the
 *   lookup retries across animation frames.
 * - On days containing raw HTML, `rehype-sanitize`'s default schema clobbers
 *   every id to `user-content-<id>` — the fallback lookup keeps those days
 *   deep-linkable without weakening the sanitizer.
 */
export function useScrollToHash(ready: boolean): void {
  const location = useLocation();
  useEffect(() => {
    if (!ready) return;
    const hash = decodeURIComponent(location.hash?.replace(/^#/, "") ?? "");
    if (!hash) return;
    let findAttempts = 0;
    let cancelled = false;
    const target = () =>
      document.getElementById(hash) ?? document.getElementById(`user-content-${hash}`);

    // Offset keeps the heading clear of the sticky app header (and the jump
    // index bar on pages that have one) instead of hidden underneath it.
    const OFFSET = 88;

    // Scroll, then re-measure and correct. Long documents lazy-load images; a
    // big jump reveals ones ABOVE the target which then load and grow the
    // document under the in-flight scroll, leaving the heading way off from
    // where the first scroll put it. Same settle pattern as PageJumpIndex.
    let settleAttempt = 0;
    const settle = () => {
      if (cancelled) return;
      const el = target();
      if (!el) return;
      const delta = el.getBoundingClientRect().top - OFFSET;
      if (Math.abs(delta) <= 4 || settleAttempt > 8) return;
      window.scrollTo({
        top: Math.max(0, window.scrollY + delta),
        behavior: settleAttempt === 0 ? "smooth" : "auto",
      });
      settleAttempt += 1;
      setTimeout(settle, settleAttempt === 1 ? 420 : 110);
    };

    const tryFind = () => {
      if (cancelled) return;
      if (target()) {
        settle();
        return;
      }
      if (findAttempts++ < 10) requestAnimationFrame(tryFind);
    };
    requestAnimationFrame(tryFind);
    return () => {
      cancelled = true;
    };
  }, [ready, location.hash]);
}
