import { useEffect, memo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useAdmin } from "@/hooks/useAdmin";
import { useUserTier } from "@/hooks/useUserTier";
import Dashboard from "./Dashboard";

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
      tier === "explorer" ? "/learning-track/explorer" : "/learning-track/pre-rnf";
    return <Navigate to={target} replace />;
  }

  return <Dashboard />;
});

export default Index;
