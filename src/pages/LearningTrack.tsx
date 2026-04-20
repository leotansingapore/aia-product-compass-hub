import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Compass, BookOpen, Briefcase, Lock, CheckCircle2, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FEATURES } from "@/lib/tiers";
import { migrateLocalProgress } from "@/lib/learning-track/migrateLocalProgress";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";

/** Admin tabs — kept for admin/master_admin only */
const LT_TAB_NAV_CLASS =
  "flex w-full flex-nowrap justify-start gap-0 overflow-x-auto sm:gap-6 md:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const LT_TAB_LINK_CLASS =
  "shrink-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-white/75 shadow-none transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-[44px] sm:min-h-0 sm:px-2 sm:py-3";
const LT_TAB_ACTIVE_CLASS = "border-white text-white";

/** Journey path tier steps for learners */
const JOURNEY_STEPS = [
  { key: "explorer", label: "Explorer", desc: "Orientation", icon: Compass, path: "/learning-track/explorer", feature: FEATURES.EXPLORER_TRACK },
  { key: "papers_taker", label: "Papers-taker", desc: "Pre-RNF Training", icon: BookOpen, path: "/learning-track/pre-rnf", feature: FEATURES.PRE_RNF_TRACK },
  { key: "post_rnf", label: "Post-RNF", desc: "Licensed Consultant", icon: Briefcase, path: "/learning-track/post-rnf", feature: FEATURES.POST_RNF_TRACK },
] as const;

export default function LearningTrack() {
  const { isAdmin } = useAdmin();
  const { user } = useSimplifiedAuth();
  const { can, isAdminBypass } = useFeatureAccess();
  const showAdminTab = isAdmin;
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

  // ---- Admin: keep tab navigation ----
  if (isAdmin) {
    return (
      <PageLayout title="Learning Track" description="Your learning journey.">
        <BrandedPageHeader
          tone="dark"
          showOnMobile
          title="Learning Track"
          subtitle="Your learning journey. Complete each module in order."
          headerTabs={
            <nav className={LT_TAB_NAV_CLASS} aria-label="Learning track sections">
              {showExplorerTab && (
                <NavLink to="/learning-track/explorer" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>Explorer</NavLink>
              )}
              {showPreRnfTab && (
                <NavLink to="/learning-track/pre-rnf" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>Pre-RNF Training</NavLink>
              )}
              {showPostRnfTab && (
                <NavLink to="/learning-track/post-rnf" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>Post-RNF Training</NavLink>
              )}
              <NavLink to="/learning-track/first-60-days" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>First 60 Days</NavLink>
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
  // Determine which step is "current" based on the highest accessible tier
  const accessibleSteps = JOURNEY_STEPS.filter((s) => can(s.feature));
  const currentTierKey = accessibleSteps.length > 0 ? accessibleSteps[accessibleSteps.length - 1].key : "explorer";

  return (
    <PageLayout title="Learning Track" description="Your learning journey.">
      {/* Journey path bar — always shown so Explorer-only learners still see
          a roadmap of future phases (Papers-taker, Post-RNF) as locked steps. */}
      {(
        <div className="border-b bg-card/50">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
            {/* Horizontal journey path */}
            <div className="flex items-center justify-center gap-0">
              {JOURNEY_STEPS.map((step, idx) => {
                const accessible = can(step.feature);
                const isActive = location.pathname.startsWith(step.path);
                const isCurrent = step.key === currentTierKey;
                const isDone = accessible && !isCurrent && JOURNEY_STEPS.findIndex((s) => s.key === currentTierKey) > idx;
                const isLocked = !accessible;

                return (
                  <div key={step.key} className="flex items-center">
                    {/* Connector line (not before first) */}
                    {idx > 0 && (
                      <div className={cn(
                        "w-8 sm:w-16 h-0.5 transition-colors",
                        isDone ? "bg-green-500" : isLocked ? "bg-border border-dashed" : "bg-primary/30",
                      )} />
                    )}

                    {/* Step node — locked tiers render as a div so the anchor
                        doesn't leave `#` in history or show a focus ring. */}
                    {(() => {
                      const stepClasses = cn(
                        "group flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all",
                        isActive && "bg-primary/10 ring-1 ring-primary/20",
                        !isActive && accessible && "hover:bg-muted/60",
                        isLocked && "cursor-not-allowed opacity-50",
                      );
                      const inner = (
                        <>
                          <div className={cn(
                            "shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                            isDone && "bg-green-100 dark:bg-green-950/40",
                            isCurrent && "bg-primary/15 ring-2 ring-primary/30 ring-offset-1 ring-offset-background",
                            isLocked && "bg-muted",
                            isActive && isCurrent && "ring-primary/50",
                          )}>
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : isLocked ? (
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <step.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            )}
                          </div>
                          <div className="hidden sm:block min-w-0">
                            <p className={cn(
                              "text-xs font-semibold leading-tight truncate",
                              isActive ? "text-primary" : isDone ? "text-green-700 dark:text-green-400" : isLocked ? "text-muted-foreground" : "text-foreground",
                            )}>
                              {step.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-tight truncate">{step.desc}</p>
                          </div>
                        </>
                      );
                      return accessible ? (
                        <NavLink to={step.path} className={stepClasses}>
                          {inner}
                        </NavLink>
                      ) : (
                        <div aria-disabled className={stepClasses}>{inner}</div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Secondary links */}
            {can(FEATURES.PRE_RNF_TRACK) && (
              <div className="flex items-center justify-center mt-3 pt-3 border-t border-border/40">
                <NavLink
                  to="/learning-track/first-60-days"
                  className={({ isActive }) => cn(
                    "group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                    isActive
                      ? "border-primary/40 bg-primary/15 text-primary shadow-sm"
                      : "border-primary/25 bg-primary/5 text-primary hover:border-primary/45 hover:bg-primary/10",
                  )}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  First 60 Days
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto px-2 pb-10 pt-4 sm:px-4 md:px-6">
        <Outlet />
      </div>
    </PageLayout>
  );
}
