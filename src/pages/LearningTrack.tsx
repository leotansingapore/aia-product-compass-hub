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
import { LearningTrackJourneyNav } from "@/components/learning-track/LearningTrackJourneyNav";

/** Admin tabs — kept for admin/master_admin only */
const LT_TAB_NAV_CLASS =
  "flex w-full flex-nowrap justify-start gap-0 overflow-x-auto sm:gap-6 md:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const LT_TAB_LINK_CLASS =
  "shrink-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-white/75 shadow-none transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-[44px] sm:min-h-0 sm:px-2 sm:py-3";
const LT_TAB_ACTIVE_CLASS = "border-white text-white";

export default function LearningTrack() {
  const { isAdmin } = useAdmin();
  const { user } = useSimplifiedAuth();
  const { can, isAdminBypass } = useFeatureAccess();
  const showExplorerTab = isAdminBypass || can(FEATURES.EXPLORER_TRACK);
  const showPreRnfTab = isAdminBypass || can(FEATURES.PRE_RNF_TRACK);
  const showPostRnfTab = isAdminBypass || can(FEATURES.POST_RNF_TRACK);
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

  // Derive current track name from route for admin header
  const trackName = location.pathname.includes("/first-14-days") ? "Your First 14 Days"
    : location.pathname.includes("/explorer") ? "Your First 14 Days"
    : location.pathname.includes("/pre-rnf") ? "Pre-RNF Training"
    : location.pathname.includes("/post-rnf") ? "Post-RNF Training"
    : location.pathname.includes("/first-60-days") ? "First 60 Days"
    : location.pathname.includes("/next-60-days") ? "Next 60 Days"
    : location.pathname.includes("/product-mastery") ? "Product Mastery Track"
    : location.pathname.includes("/admin") ? "Admin"
    : "Learning Track";

  // ---- Admin: keep tab navigation ----
  if (isAdmin) {
    return (
      <PageLayout title={`${trackName} — Learning Track`} description="Your learning journey.">
        <BrandedPageHeader
          tone="dark"
          showOnMobile
          title={trackName}
          subtitle="Learning Track"
          brandLogoSrc={null}
          headerTabs={
            <nav className={LT_TAB_NAV_CLASS} aria-label="Learning track sections">
              {showExplorerTab && (
                <NavLink to="/learning-track/first-14-days" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>Your First 14 Days</NavLink>
              )}
              {showPreRnfTab && (
                <NavLink to="/learning-track/pre-rnf" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>Pre-RNF Training</NavLink>
              )}
              {showPostRnfTab && (
                <NavLink to="/learning-track/post-rnf" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>Post-RNF Training</NavLink>
              )}
              <NavLink to="/cmfas-exams" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>CMFAS Exams</NavLink>
              <NavLink to="/learning-track/admin" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>Admin</NavLink>
            </nav>
          }
        />
        <div className="mx-auto px-2 pb-10 pt-4 sm:px-4 md:px-6">
          <Outlet />
        </div>
      </PageLayout>
    );
  }

  // ---- Learner: journey path ----

  return (
    <PageLayout title="Learning Track" description="Your learning journey.">
      {/* Journey path bar — always shown so Explorer-only learners still see
          a roadmap of future phases (Papers-taker, Post-RNF) as locked steps. */}
      <LearningTrackJourneyNav />

      <div className="mx-auto px-2 pb-10 pt-4 sm:px-4 md:px-6">
        <Outlet />
      </div>
    </PageLayout>
  );
}
