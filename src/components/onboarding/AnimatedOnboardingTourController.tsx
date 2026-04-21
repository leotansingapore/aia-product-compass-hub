import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import {
  AnimatedOnboardingTour,
  hasSeenAnimatedTour,
} from "./AnimatedOnboardingTour";

const SKIP_PATHS = [
  "/auth",
  "/force-password",
  "/reset-password",
  "/awaiting-approval",
];

export function AnimatedOnboardingTourController() {
  const { user, loading } = useSimplifiedAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (SKIP_PATHS.some((p) => location.pathname.startsWith(p))) return;

    const params = new URLSearchParams(location.search);
    const forced = params.get("tour") === "1";

    if (forced) {
      setOpen(true);
      return;
    }

    if (!hasSeenAnimatedTour(user.id)) {
      const t = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(t);
    }
  }, [user, loading, location.pathname, location.search]);

  if (!open) return null;

  return <AnimatedOnboardingTour open={open} onClose={() => setOpen(false)} />;
}
