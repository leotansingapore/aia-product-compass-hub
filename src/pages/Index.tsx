import { useEffect, memo, lazy, Suspense } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useAdmin } from "@/hooks/useAdmin";
import { useUserTier } from "@/hooks/useUserTier";

// Dashboard is admin-only — learners redirect to their learning track before
// it ever renders. Lazy-loading it keeps the admin-only chunk out of every
// learner's first paint.
const Dashboard = lazy(() => import("./Dashboard"));

const Index = memo(() => {
  const { user, loading } = useSimplifiedAuth();
  const { isAdmin } = useAdmin();
  const { tier } = useUserTier();
  const navigate = useNavigate();

  const hasRecoveryHash =
    typeof window !== "undefined" &&
    (window.location.hash.includes("type=recovery") ||
      window.location.hash.includes("access_token="));

  useEffect(() => {
    if (hasRecoveryHash) {
      navigate("/reset-password", { replace: true });
      return;
    }
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate, hasRecoveryHash]);

  if (loading) {
    return <SkeletonLoader type="dashboard" />;
  }

  if (!user) {
    return null;
  }

  // Admins see the full dashboard (search, categories, progress overview).
  // Regular learners go straight to their tier's track — skip the intermediate
  // /learning-track redirect so we only cross one Suspense boundary, not two.
  if (!isAdmin) {
    const target =
      tier === "explorer" ? "/learning-track/first-14-days" : "/learning-track/pre-rnf";
    return <Navigate to={target} replace />;
  }

  return <Dashboard />;
});

export default Index;
