import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BookOpen, Briefcase, CheckCircle2, Compass, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useUserTier } from "@/hooks/useUserTier";
import { FEATURES, type TierLevel } from "@/lib/tiers";
import { RequestUpgradeButton } from "@/components/tier/RequestUpgradeButton";

type JourneyStep = {
  key: "explorer" | "papers_taker" | "post_rnf";
  label: string;
  desc: string;
  icon: LucideIcon;
  path: string;
  feature: (typeof FEATURES)[keyof typeof FEATURES];
};

const JOURNEY_STEPS: ReadonlyArray<JourneyStep> = [
  { key: "explorer", label: "Your First 14 Days", desc: "Decide the career", icon: Compass, path: "/learning-track/first-14-days", feature: FEATURES.EXPLORER_TRACK },
  { key: "papers_taker", label: "Papers-taker", desc: "Pre-RNF Training", icon: BookOpen, path: "/learning-track/pre-rnf", feature: FEATURES.PRE_RNF_TRACK },
  { key: "post_rnf", label: "Post-RNF", desc: "Licensed Consultant", icon: Briefcase, path: "/learning-track/post-rnf", feature: FEATURES.POST_RNF_TRACK },
] as const;

const NEXT_TIER: Record<string, { to: TierLevel; label: string } | null> = {
  explorer: { to: "papers_taker", label: "Papers-taker" },
  papers_taker: { to: "post_rnf", label: "Post-RNF" },
  post_rnf: null,
};

/** Exact-or-segment prefix match so `/learning-track/pre-rnf` doesn't
 *  accidentally match a hypothetical `/learning-track/pre-rnf-tournament`
 *  route in the future. */
const isPathUnder = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(base + "/");

/** Map the current pathname to the journey step it belongs to. The step's
 *  `path` (`/learning-track/pre-rnf`, etc.) only covers the canonical entry
 *  URL — but Papers-taker has many sibling pages (`/first-60-days`,
 *  `/product-mastery`, `/resources`, `/cmfas-exams`) that should still
 *  highlight Papers-taker in the rail. Same for Post-RNF + `/next-60-days`.
 *  Returns `undefined` if the path doesn't belong to any track. */
function deriveActiveKeyFromPath(pathname: string): JourneyStep["key"] | undefined {
  if (
    isPathUnder(pathname, "/learning-track/first-14-days") ||
    isPathUnder(pathname, "/learning-track/explorer")
  ) {
    return "explorer";
  }
  if (
    isPathUnder(pathname, "/learning-track/pre-rnf") ||
    isPathUnder(pathname, "/learning-track/first-60-days") ||
    isPathUnder(pathname, "/learning-track/product-mastery") ||
    isPathUnder(pathname, "/learning-track/resources") ||
    isPathUnder(pathname, "/cmfas-exams")
  ) {
    return "papers_taker";
  }
  if (
    isPathUnder(pathname, "/learning-track/post-rnf") ||
    isPathUnder(pathname, "/learning-track/next-60-days")
  ) {
    return "post_rnf";
  }
  return undefined;
}

interface Props {
  /** Optional override for which step shows as "active". Defaults to the
   *  step whose `path` is a prefix of the current URL. Pass a key explicitly
   *  for pages that live outside `/learning-track/*` (e.g. `/cmfas-exams`,
   *  which is a Papers-taker surface even though the URL doesn't say so). */
  activeKey?: JourneyStep["key"];
}

export function LearningTrackJourneyNav({ activeKey }: Props = {}) {
  const location = useLocation();
  const { can } = useFeatureAccess();
  const { tier } = useUserTier();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  const accessibleSteps = JOURNEY_STEPS.filter((s) => can(s.feature));
  const currentTierKey = accessibleSteps.length > 0
    ? accessibleSteps[accessibleSteps.length - 1].key
    : "explorer";
  const nextTier = NEXT_TIER[tier];

  return (
    <>
      <div className="border-b bg-card/50">
        <div className="mx-auto max-w-4xl px-3 py-3 sm:px-6 sm:py-4">
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

          <div className="flex items-center justify-center gap-0">
            {JOURNEY_STEPS.map((step, idx) => {
              const accessible = can(step.feature);
              const derivedActiveKey = activeKey ?? deriveActiveKeyFromPath(location.pathname);
              const isActive = derivedActiveKey === step.key;
              const isCurrent = step.key === currentTierKey;
              const isDone = accessible && !isCurrent && JOURNEY_STEPS.findIndex((s) => s.key === currentTierKey) > idx;
              const isLocked = !accessible;

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
              const node = accessible ? (
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

              return (
                <div key={step.key} className="flex items-center">
                  {idx > 0 && (
                    <div className={cn(
                      "w-6 sm:w-16 h-0.5 transition-colors",
                      isDone ? "bg-green-500" : isLocked ? "bg-border border-dashed" : "bg-primary/30",
                    )} />
                  )}
                  {node}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {nextTier && (
        <RequestUpgradeButton
          fromTier={tier}
          toTier={nextTier.to}
          open={upgradeDialogOpen}
          onOpenChange={setUpgradeDialogOpen}
          dialogOnly
        />
      )}
    </>
  );
}
