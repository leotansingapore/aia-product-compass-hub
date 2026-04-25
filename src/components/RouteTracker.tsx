import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { prefetchCommonRoutes } from '@/utils/prefetchRoutes';
import { useRouteChangeTiming } from '@/lib/perf/useRouteChangeTiming';

const ROUTE_STORAGE_KEY = 'lastVisitedRoute';

// Routes that should NOT be restored (auth-related, transient)
const EXCLUDED_ROUTES = ['/auth', '/force-password', '/reset-password'];

/**
 * Tracks the current route in localStorage so the app can restore it after a refresh.
 * Only tracks/restores for authenticated users to prevent stale redirects after sign-out.
 */
export function RouteTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useSimplifiedAuth();
  const hasRestored = useRef(false);

  // On mount: restore last route if authenticated user lands on "/"
  // Uses a ref to ensure this only fires once — Supabase can re-emit auth events
  // (token refresh, session updates) which would otherwise re-trigger this effect
  // and override intentional navigation to "/".
  useEffect(() => {
    if (loading || !user) return;
    if (hasRestored.current) return;
    hasRestored.current = true;

    // Warm up the most common learner route chunks in the background so the
    // next navigation is instant. Runs once per session, after auth resolves.
    prefetchCommonRoutes();

    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '') {
      try {
        const stored = localStorage.getItem(ROUTE_STORAGE_KEY);
        if (stored && stored !== '/' && !EXCLUDED_ROUTES.some(r => stored.startsWith(r))) {
          navigate(stored, { replace: true });
        }
      } catch {
        // localStorage unavailable
      }
    }
  }, [loading, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save current route on every navigation (only for authenticated users)
  useEffect(() => {
    if (!user) return;
    const fullPath = location.pathname + location.search;
    if (!EXCLUDED_ROUTES.some(r => location.pathname.startsWith(r))) {
      try {
        localStorage.setItem(ROUTE_STORAGE_KEY, fullPath);
      } catch {
        // localStorage unavailable
      }
    }
  }, [location.pathname, location.search, user]);

  return null;
}
