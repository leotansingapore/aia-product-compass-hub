import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Starts every newly opened page at the top.
 *
 * BrowserRouter has no scroll handling of its own, so a link clicked halfway
 * down one page opened the next page at that same offset, often near its footer
 * ("Up next" on a day page, a sidebar link from a long list).
 *
 * Only PUSH resets. REPLACE is how pages sync tabs and selections into the URL,
 * and POP (back/forward) is left to the browser's own scroll restoration.
 * Hash deep links are left alone; useScrollToHash owns those.
 */
export function useScrollToTopOnNav(): void {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType !== "PUSH" || hash) return;
    window.scrollTo(0, 0);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
}
