import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Wraps the route outlet in an error boundary so a render throw on one page
 * shows an in-place "try again" card while the app shell (nav, header) stays
 * intact — instead of the root overlay blanking the whole viewport. Keyed by
 * pathname so navigating to another route clears a tripped boundary.
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname} sectionName="this page">
      {children}
    </ErrorBoundary>
  );
}
