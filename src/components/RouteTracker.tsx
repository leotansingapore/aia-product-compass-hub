import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ROUTE_STORAGE_KEY = 'lastVisitedRoute';

// Routes that should NOT be restored (auth-related, transient)
const EXCLUDED_ROUTES = ['/auth', '/force-password', '/reset-password', '/awaiting-approval'];

/**
 * Tracks the current route in localStorage so the app can restore it after a refresh.
 * On first mount, if the user lands on "/" but was previously on another page, redirect there.
 */
export function RouteTracker() {
  const location = useLocation();
  const navigate = useNavigate();

  // On mount: restore last route if we landed on "/"
  useEffect(() => {
    const currentPath = window.location.pathname;
    // Only restore if we're at the root and there's a stored route
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save current route on every navigation
  useEffect(() => {
    const fullPath = location.pathname + location.search;
    if (!EXCLUDED_ROUTES.some(r => location.pathname.startsWith(r))) {
      try {
        localStorage.setItem(ROUTE_STORAGE_KEY, fullPath);
      } catch {
        // localStorage unavailable
      }
    }
  }, [location.pathname, location.search]);

  return null;
}
