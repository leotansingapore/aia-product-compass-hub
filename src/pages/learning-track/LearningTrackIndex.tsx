import { Navigate } from "react-router-dom";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FEATURES } from "@/lib/tiers";

/**
 * Default landing for `/learning-track`. Picks the first track the current
 * user can access so we never bounce them off a `RequireTier` redirect:
 *   - admins / Papers+ → Pre-RNF (the historical default)
 *   - Explorer-tier   → Explorer
 *   - no access       → home
 */
export default function LearningTrackIndex() {
  const { can, isAdminBypass } = useFeatureAccess();

  if (isAdminBypass || can(FEATURES.PRE_RNF_TRACK)) {
    return <Navigate to="/learning-track/pre-rnf" replace />;
  }
  if (can(FEATURES.EXPLORER_TRACK)) {
    return <Navigate to="/learning-track/first-14-days" replace />;
  }
  return <Navigate to="/" replace />;
}
