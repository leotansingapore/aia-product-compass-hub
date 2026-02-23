import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';

const ROUTE_STORAGE_KEY = 'lastVisitedRoute';

// Routes that should NOT be restored (auth-related, transient)
const EXCLUDED_ROUTES = ['/auth', '/force-password', '/reset-password', '/awaiting-approval'];

/**
 * Tracks the current route in localStorage so the app can restore it after a refresh.
 * Only tracks/restores for authenticated users to prevent stale redirects after sign-out.
 */
export function RouteTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useSimplifiedAuth();

  // On mount: restore last route if authenticated user lands on "/"
  useEffect(() => {
    if (loading || !user) return;
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
