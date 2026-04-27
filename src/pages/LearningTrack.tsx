import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Compass, BookOpen, Briefcase, Lock, CheckCircle2, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useUserTier } from "@/hooks/useUserTier";
import { FEATURES, type TierLevel } from "@/lib/tiers";
import { migrateLocalProgress } from "@/lib/learning-track/migrateLocalProgress";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { PageLayout } from "@/components/layout/PageLayout";
import { RequestUpgradeButton } from "@/components/tier/RequestUpgradeButton";

/** Admin tabs — kept for admin/master_admin only */
const LT_TAB_NAV_CLASS =
  "flex w-full flex-nowrap justify-start gap-0 overflow-x-auto sm:gap-6 md:gap-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const LT_TAB_LINK_CLASS =
  "shrink-0 rounded-none border-0 border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-white/75 shadow-none transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent min-h-[44px] sm:min-h-0 sm:px-2 sm:py-3";
const LT_TAB_ACTIVE_CLASS = "border-white text-white";

/** Journey path tier steps for learners */
const JOURNEY_STEPS = [
  { key: "explorer", label: "Your First 14 Days", desc: "Decide the career", icon: Compass, path: "/learning-track/first-14-days", feature: FEATURES.EXPLORER_TRACK },
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

  const { tier } = useUserTier();
  const accessibleSteps = JOURNEY_STEPS.filter((s) => can(s.feature));
  const currentTierKey = accessibleSteps.length > 0 ? accessibleSteps[accessibleSteps.length - 1].key : "explorer";
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Next tier for upgrade — used when clicking a locked journey node
  const NEXT_TIER: Record<string, { to: TierLevel; label: string } | null> = {
    explorer: { to: "papers_taker", label: "Papers-taker" },
    papers_taker: { to: "post_rnf", label: "Post-RNF" },
    post_rnf: null,
  };
  const nextTier = NEXT_TIER[tier];

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
              <NavLink to="/learning-track/first-60-days" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>First 60 Days</NavLink>
              <NavLink to="/learning-track/product-mastery" className={({ isActive }) => cn(LT_TAB_LINK_CLASS, isActive && LT_TAB_ACTIVE_CLASS)}>Product Mastery</NavLink>
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
      {(
        <div className="border-b bg-card/50">
          <div className="mx-auto max-w-4xl px-3 py-3 sm:px-6 sm:py-4">
            {/* Mobile-only label above nodes — shows current stage so learners get context without enlarging the nodes. */}
            {(() => {
              const current = JOURNEY_STEPS.find((s) => s.key === currentTierKey);
              if (!current) return null;
              return (
                <div className="mb-2 text-center sm:hidden">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Current stage
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {current.label}{" "}
                    <span className="font-normal text-muted-foreground">· {current.desc}</span>
                  </p>
                </div>
              );
            })()}

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
                        "w-6 sm:w-16 h-0.5 transition-colors",
                        isDone ? "bg-green-500" : isLocked ? "bg-border border-dashed" : "bg-primary/30",
                      )} />
                    )}

                    {/* Step node — locked tiers render as a div so the anchor
                        doesn't leave `#` in history or show a focus ring. */}
                    {(() => {
                      const stepClasses = cn(
                        "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all sm:px-3",
                        isActive && "bg-primary/10 ring-1 ring-primary/20",
                        !isActive && accessible && "hover:bg-muted/60",
                        isLocked && "cursor-not-allowed opacity-50",
                      );
                      const inner = (
                        <>
                          <div className={cn(
                            "shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all sm:w-9 sm:h-9",
                            isDone && "bg-green-100 dark:bg-green-950/40",
                            isCurrent && "bg-primary/15 ring-2 ring-primary/30 ring-offset-1 ring-offset-background",
                            isLocked && "bg-muted",
                            isActive && isCurrent && "ring-primary/50",
                          )}>
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : isLocked ? (
                              <Lock className="h-4 w-4 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                            ) : (
                              <step.icon className={cn("h-5 w-5 sm:h-4 sm:w-4", isActive ? "text-primary" : "text-muted-foreground")} />
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
                      const ariaLabel = `${step.label} — ${step.desc}${isLocked ? " (locked)" : ""}`;
                      return accessible ? (
                        <NavLink to={step.path} className={stepClasses} aria-label={ariaLabel}>
                          {inner}
                        </NavLink>
                      ) : nextTier ? (
                        <button
                          type="button"
                          onClick={() => setUpgradeDialogOpen(true)}
                          className={cn(stepClasses, "cursor-pointer !opacity-60 hover:!opacity-80")}
                          title={`Upgrade to ${nextTier.label} to unlock`}
                          aria-label={ariaLabel}
                        >
                          {inner}
                        </button>
                      ) : (
                        <div aria-disabled className={stepClasses} aria-label={ariaLabel}>{inner}</div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      <div className="mx-auto px-2 pb-10 pt-4 sm:px-4 md:px-6">
        <Outlet />
      </div>

      {/* Upgrade dialog — triggered by clicking locked journey nodes */}
      {nextTier && (
        <RequestUpgradeButton
          fromTier={tier}
          toTier={nextTier.to}
          open={upgradeDialogOpen}
          onOpenChange={setUpgradeDialogOpen}
          dialogOnly
        />
      )}
    </PageLayout>
  );
}
