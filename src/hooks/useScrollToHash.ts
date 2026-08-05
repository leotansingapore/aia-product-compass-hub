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
    let timer: number | undefined;
    const target = () =>
      document.getElementById(hash) ?? document.getElementById(`user-content-${hash}`);

    // Offset keeps the heading clear of the sticky app header (and the jump
    // index bar on pages that have one) instead of hidden underneath it.
    const OFFSET = 88;
    // How long to keep correcting. A fixed attempt count is not enough: on a
    // COLD arrival the day's markdown chunk, its images and webfonts land over
    // several seconds, and each one that resolves ABOVE the target grows the
    // document and pushes the heading down again. Measured on production, a
    // warm load settles instantly while a cold one was still drifting after
    // ~1.2s and left the heading ~470px off. Correct until the position holds
    // still, not until an arbitrary number of tries.
    const DEADLINE_MS = 6000;
    const STABLE_CHECKS = 3;

    const started = Date.now();
    let stable = 0;
    let first = true;

    const settle = () => {
      if (cancelled) return;
      const el = target();
      if (!el) return;
      const delta = el.getBoundingClientRect().top - OFFSET;
      if (Math.abs(delta) <= 4) {
        // Hold still for a few consecutive checks before trusting it — late
        // images can still shift things after a moment of apparent calm.
        if (++stable >= STABLE_CHECKS || Date.now() - started > DEADLINE_MS) return;
      } else {
        stable = 0;
        window.scrollTo({
          top: Math.max(0, window.scrollY + delta),
          behavior: first ? "smooth" : "auto",
        });
        if (Date.now() - started > DEADLINE_MS) return;
      }
      const wait = first ? 420 : 140;
      first = false;
      timer = window.setTimeout(settle, wait);
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
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [ready, location.hash]);
}
