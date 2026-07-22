import { useEffect, memo, Suspense } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useAdmin } from "@/hooks/useAdmin";
import { useUserTier } from "@/hooks/useUserTier";
import { lazyWithRetry } from "@/utils/lazyWithRetry";

// Dashboard is admin-only — learners redirect to their learning track before
// it ever renders. Lazy-loading it keeps the admin-only chunk out of every
// learner's first paint. Use lazyWithRetry to recover from stale chunk hashes
// after a fresh deploy.
const Dashboard = lazyWithRetry(() => import("./Dashboard"));

const Index = memo(() => {
  const { user, loading } = useSimplifiedAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { tier } = useUserTier();
  const navigate = useNavigate();

  const hasRecoveryHash =
    typeof window !== "undefined" &&
    (window.location.hash.includes("type=recovery") ||
      window.location.hash.includes("access_token="));

  useEffect(() => {
    if (hasRecoveryHash) {
      // Preserve the hash — it still carries the recovery token, and dropping it
      // here was leaving /reset-password with no session to work from.
      navigate(`/reset-password${window.location.hash}`, { replace: true });
      return;
    }
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate, hasRecoveryHash]);

  // Wait for BOTH auth and the async admin-role fetch. Redirecting on
  // `!isAdmin` while the role is still in flight sent admins to the learner
  // track on every fresh load of `/`.
  if (loading || adminLoading) {
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

  return (
    <Suspense fallback={<SkeletonLoader type="dashboard" />}>
      <Dashboard />
    </Suspense>
  );
});

export default Index;
