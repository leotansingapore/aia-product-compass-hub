import { useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import Dashboard from "./Dashboard";

const Index = memo(() => {
  const { user, loading } = useSimplifiedAuth();
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

  return <Dashboard />;
});

export default Index;
