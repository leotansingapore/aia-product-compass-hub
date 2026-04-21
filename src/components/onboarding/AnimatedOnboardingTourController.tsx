import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useGlobalTourReset } from "@/hooks/useGlobalTourReset";
import { hasSeenAnimatedTour } from "./tourStorage";

const AnimatedOnboardingTour = lazy(() =>
  import("./AnimatedOnboardingTour").then(m => ({
    default: m.AnimatedOnboardingTour,
  }))
);

const SKIP_PATHS = [
  "/auth",
  "/force-password",
  "/reset-password",
  "/awaiting-approval",
];

export function AnimatedOnboardingTourController() {
  const { user, loading } = useSimplifiedAuth();
  const location = useLocation();
  const { resetAt, loaded: resetLoaded } = useGlobalTourReset();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (!resetLoaded) return;
    if (SKIP_PATHS.some((p) => location.pathname.startsWith(p))) return;

    const params = new URLSearchParams(location.search);
    const forced = params.get("tour") === "1";

    if (forced) {
      setOpen(true);
      return;
    }

    if (!hasSeenAnimatedTour(user.id, resetAt)) {
      const t = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(t);
    }
  }, [user, loading, resetLoaded, resetAt, location.pathname, location.search]);

  if (!open) return null;

  return (
    <Suspense fallback={null}>
      <AnimatedOnboardingTour open={open} onClose={() => setOpen(false)} />
    </Suspense>
  );
}
