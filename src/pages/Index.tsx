import { useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useUserTier } from "@/hooks/useUserTier";
import { usePermissions } from "@/hooks/usePermissions";
import Dashboard from "./Dashboard";
import ExplorerHome from "./ExplorerHome";

const Index = memo(() => {
  const { user, loading } = useSimplifiedAuth();
  const { tier, isLoading: tierLoading } = useUserTier();
  const { isMasterAdmin, hasRole } = usePermissions();
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

  if (loading || tierLoading) {
    return <SkeletonLoader type="dashboard" />;
  }

  if (!user) {
    return null;
  }

  // Admins always see the full dashboard regardless of tier, so they can
  // test / support without constantly bumping their own tier.
  const isAdminBypass = isMasterAdmin() || hasRole('admin');

  if (tier === 'explorer' && !isAdminBypass) {
    return <ExplorerHome />;
  }

  return <Dashboard />;
});

export default Index;
