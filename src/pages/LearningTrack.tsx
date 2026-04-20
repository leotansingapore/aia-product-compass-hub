import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FEATURES } from "@/lib/tiers";
import { migrateLocalProgress } from "@/lib/learning-track/migrateLocalProgress";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";

/** Underline tabs on brand gradient header (aligned with CMFAS hub pattern). */
const LT_TAB_NAV_CLASS =
  "flex w-full flex-nowrap justify-start gap-0 overflow-x-auto sm:gap-6 md:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const LT_TAB_LINK_CLASS =
  "shrink-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-white/75 shadow-none transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-[44px] sm:min-h-0 sm:px-2 sm:py-3";
const LT_TAB_ACTIVE_CLASS = "border-white text-white";

export default function LearningTrack() {
  const { isAdmin } = useAdmin();
  const { user } = useSimplifiedAuth();
  const { can, isAdminBypass } = useFeatureAccess();
  const showAdminTab = isAdmin;
  const showExplorerTab = isAdminBypass || can(FEATURES.EXPLORER_TRACK);
  const showPreRnfTab = isAdminBypass || can(FEATURES.PRE_RNF_TRACK);
  const showPostRnfTab = isAdminBypass || can(FEATURES.POST_RNF_TRACK);
  const showResourcesTab = isAdminBypass || can(FEATURES.PRE_RNF_TRACK);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/learning-track" && location.pathname.startsWith("/learning-track/")) {
      localStorage.setItem("lt-last-tab", location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (user?.id) {
      migrateLocalProgress(user.id).catch((err) =>
        console.error("Learning track migration failed:", err)
      );
    }
  }, [user?.id]);

  // Explorer-only users (no Pre-RNF, Post-RNF, Resources, or Admin tabs) get a
  // clean page without the dark branded header — Explorer.tsx renders its own
  // beginner-friendly welcome hero instead.
  const tabCount = [showExplorerTab, showPreRnfTab, showPostRnfTab, showResourcesTab, showAdminTab].filter(Boolean).length;
  const explorerOnly = tabCount === 1 && showExplorerTab;

  return (
    <PageLayout title="Learning Track" description="Your learning journey. Complete each module in order.">
      {!explorerOnly && (
        <BrandedPageHeader
          tone="dark"
          showOnMobile
          title="Learning Track"
          subtitle="Your learning journey. Complete each module in order."
          headerTabs={
            <nav className={LT_TAB_NAV_CLASS} aria-label="Learning track sections">
              {showExplorerTab && (
                <NavLink
                  to="/learning-track/explorer"
                  className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}
                >
                  Explorer
                </NavLink>
              )}
              {showPreRnfTab && (
                <NavLink
                  to="/learning-track/pre-rnf"
                  className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}
                >
                  Pre-RNF Training
                </NavLink>
              )}
              {showPostRnfTab && (
                <NavLink
                  to="/learning-track/post-rnf"
                  className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}
                >
                  Post-RNF Training
                </NavLink>
              )}
              {showResourcesTab && (
                <NavLink
                  to="/learning-track/resources"
                  className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}
                >
                  Resources
                </NavLink>
              )}
              <NavLink
                to="/learning-track/first-60-days"
                className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}
              >
                First 60 Days
              </NavLink>
              {showAdminTab && (
                <NavLink
                  to="/learning-track/admin"
                  className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}
                >
                  Admin
                </NavLink>
              )}
            </nav>
          }
        />
      )}

      <div className="mx-auto px-2 pb-10 pt-4 sm:px-4 md:px-6">
        <Outlet />
      </div>
    </PageLayout>
  );
}
