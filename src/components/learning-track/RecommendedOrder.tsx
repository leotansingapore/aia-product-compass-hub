import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { getAllWeeks as getF60Weeks } from "@/features/first-60-days/content";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { loadAllAssignments } from "@/features/first-60-days/assignments";
import {
  getAllWeeks as getPMWeeks,
  WEEK_META as PM_WEEK_META,
} from "@/features/product-mastery-track/content";
import { useProductMasteryProgress } from "@/hooks/product-mastery-track/useProductMasteryProgress";

const ASSIGNMENTS_PRODUCT_ID = "first-60-days-assignments";

// Study order for the four licensing papers (same as the checklist).
const CMFAS_EXAMS = [
  { moduleId: "m9", label: "M9 — Life Insurance" },
  { moduleId: "m9a", label: "M9A — Life Insurance (Advanced)" },
  { moduleId: "res5", label: "RES5 — Rules & Regulations" },
  { moduleId: "hi", label: "HI — Health Insurance" },
] as const;

type StepKind = "training" | "assignment" | "cmfas" | "mastery";

type Step = {
  key: string;
  kind: StepKind;
  title: string;
  sub?: string;
  to: string;
  done: boolean;
};

const KIND_META: Record<StepKind, { label: string; icon: typeof CalendarDays; chip: string }> = {
  training: {
    label: "Week training",
    icon: CalendarDays,
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  assignment: {
    label: "Assignment",
    icon: ClipboardList,
    chip: "bg-primary/10 text-primary",
  },
  cmfas: {
    label: "CMFAS paper",
    icon: GraduationCap,
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  mastery: {
    label: "Product Mastery",
    icon: Sparkles,
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
};

function readCmfasPassed(userId: string | undefined): Set<string> {
  if (!userId || typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(`cmfas-exams-passed-${userId}`);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function useSubmittedKeys(userId: string | undefined) {
  return useQuery({
    queryKey: ["recommended-order-submissions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("assignment_submissions")
        .select("item_id")
        .eq("product_id", ASSIGNMENTS_PRODUCT_ID)
        .eq("user_id", userId);
      if (error) throw error;
      return new Set<string>(((data ?? []) as { item_id: string }[]).map((r) => r.item_id));
    },
  });
}

function useAssignmentsList() {
  return useQuery({
    queryKey: ["checklist-assignments-list"],
    queryFn: loadAllAssignments,
    staleTime: Infinity,
  });
}

/**
 * Weaves the four learning streams into one recommended path so a learner does a
 * MIX each week instead of grinding one stream to exhaustion. Week training and
 * assignments are interleaved proportionally (both finish around the same time);
 * the four CMFAS papers are spaced evenly through that run; Product Mastery sits
 * at the very end, once the field foundation and licensing are in place.
 */
function buildSteps(args: {
  weeks: ReturnType<typeof getF60Weeks>;
  assignments: Awaited<ReturnType<typeof loadAllAssignments>>;
  pmWeeks: ReturnType<typeof getPMWeeks>;
  isF60DayDone: (day: number) => boolean;
  isPmDayDone: (day: number) => boolean;
  submitted: Set<string>;
  cmfasPassed: Set<string>;
}): Step[] {
  const { weeks, assignments, pmWeeks, isF60DayDone, isPmDayDone, submitted, cmfasPassed } = args;

  const weekSteps: Step[] = weeks.map((w) => ({
    key: `training-w${w.weekNumber}`,
    kind: "training",
    title: `Week ${w.weekNumber}: ${w.title}`,
    sub: `${w.days.length} day${w.days.length === 1 ? "" : "s"} of First 60 Days`,
    to: `/learning-track/first-60-days/day/${(w.days.find((d) => !isF60DayDone(d.dayNumber)) ?? w.days[0]).dayNumber}`,
    done: w.days.length > 0 && w.days.every((d) => isF60DayDone(d.dayNumber)),
  }));

  const assignmentSteps: Step[] = assignments
    .slice()
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order)
    .map((a) => ({
      key: `assignment-${a.slug}`,
      kind: "assignment",
      title: `Assignment ${a.frontmatter.order}: ${a.frontmatter.title}`,
      sub: a.frontmatter.deliverable,
      to: `/learning-track/pre-rnf/assignments/${a.frontmatter.url_slug ?? a.slug}`,
      done: submitted.has(a.frontmatter.status_key),
    }));

  // Proportional merge: pull from whichever stream is furthest behind its own
  // share of the run, so weeks and assignments alternate rather than batch.
  const core: Step[] = [];
  let wi = 0;
  let ai = 0;
  const W = weekSteps.length;
  const A = assignmentSteps.length;
  while (wi < W || ai < A) {
    const takeAssignment =
      ai < A && (wi >= W || A === 0 ? false : ai / A <= wi / Math.max(W, 1));
    if (takeAssignment || wi >= W) {
      if (ai < A) core.push(assignmentSteps[ai++]);
      else if (wi < W) core.push(weekSteps[wi++]);
    } else {
      core.push(weekSteps[wi++]);
    }
  }

  // Slot the four CMFAS papers at evenly spaced points across the core run.
  const cmfasSteps: Step[] = CMFAS_EXAMS.map((e) => ({
    key: `cmfas-${e.moduleId}`,
    kind: "cmfas",
    title: e.label,
    sub: "Pass at the test centre, then tick it on your checklist",
    to: `/cmfas/module/${e.moduleId}`,
    done: cmfasPassed.has(e.moduleId),
  }));

  const withCmfas: Step[] = [];
  const slotEvery = CMFAS_EXAMS.length > 0 ? core.length / (CMFAS_EXAMS.length + 1) : Infinity;
  let nextCmfas = 0;
  core.forEach((step, idx) => {
    withCmfas.push(step);
    while (
      nextCmfas < cmfasSteps.length &&
      idx + 1 >= Math.round((nextCmfas + 1) * slotEvery)
    ) {
      withCmfas.push(cmfasSteps[nextCmfas++]);
    }
  });
  while (nextCmfas < cmfasSteps.length) withCmfas.push(cmfasSteps[nextCmfas++]);

  // Product Mastery last — the deep product knowledge you layer on once the
  // field foundation and licensing are in place.
  const masterySteps: Step[] = pmWeeks.map((w) => {
    const meta = PM_WEEK_META[w.weekNumber];
    return {
      key: `mastery-w${w.weekNumber}`,
      kind: "mastery" as const,
      title: meta?.title ?? `Product Mastery week ${w.weekNumber}`,
      sub: `${w.days.length} day${w.days.length === 1 ? "" : "s"} of product deep-dive`,
      to: `/learning-track/product-mastery/day/${(w.days.find((d) => !isPmDayDone(d.dayNumber)) ?? w.days[0]).dayNumber}`,
      done: w.days.length > 0 && w.days.every((d) => isPmDayDone(d.dayNumber)),
    };
  });

  return [...withCmfas, ...masterySteps];
}

function StepRow({ step, index, isCurrent, isLast }: {
  step: Step;
  index: number;
  isCurrent: boolean;
  isLast: boolean;
}) {
  const meta = KIND_META[step.kind];
  const Icon = meta.icon;
  return (
    <li className="relative flex gap-3">
      {/* Rail + node */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            step.done
              ? "border-green-500 bg-green-500/15 text-green-600 dark:text-green-400"
              : isCurrent
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground",
          )}
        >
          {step.done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>
        {!isLast && (
          <div className={cn("w-0.5 flex-1", step.done ? "bg-green-500/40" : "bg-border")} />
        )}
      </div>

      {/* Card */}
      <Link
        to={step.to}
        className={cn(
          "group mb-2 min-w-0 flex-1 rounded-xl border p-3 transition-colors hover:border-primary/40 hover:bg-muted/40",
          isCurrent && "border-primary/40 bg-primary/5 ring-1 ring-primary/20",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", meta.chip)}>
            {meta.label}
          </span>
          {isCurrent && !step.done && (
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
              Start next <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </div>
        <p
          className={cn(
            "mt-1 text-sm font-medium leading-snug",
            step.done && "text-muted-foreground line-through decoration-muted-foreground/40",
          )}
        >
          {step.title}
        </p>
        {step.sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{step.sub}</p>}
      </Link>
    </li>
  );
}

export default function RecommendedOrder() {
  const { user } = useSimplifiedAuth();
  const userId = user?.id;

  const f60Progress = useFirst60DaysProgress();
  const pmProgress = useProductMasteryProgress();
  const { data: assignments } = useAssignmentsList();
  const { data: submitted } = useSubmittedKeys(userId);

  const weeks = useMemo(() => getF60Weeks(), []);
  const pmWeeks = useMemo(() => getPMWeeks(), []);
  const cmfasPassed = useMemo(() => readCmfasPassed(userId), [userId]);

  const steps = useMemo(() => {
    if (!assignments) return [];
    return buildSteps({
      weeks,
      assignments,
      pmWeeks,
      isF60DayDone: (d) => f60Progress.isDayComplete(d),
      isPmDayDone: (d) => pmProgress.isDayComplete(d),
      submitted: submitted ?? new Set<string>(),
      cmfasPassed,
    });
  }, [weeks, assignments, pmWeeks, f60Progress, pmProgress, submitted, cmfasPassed]);

  const doneCount = steps.filter((s) => s.done).length;
  const pct = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;
  const currentIdx = steps.findIndex((s) => !s.done);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Recommended order
            </p>
            <h2 className="mt-1 font-serif text-lg font-bold leading-tight sm:text-2xl">
              The optimal path, not one stream at a time.
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Week training, assignments and CMFAS papers are woven together so you keep a healthy
              mix going. Product Mastery comes last, once your field foundation and licence are set.
            </p>
          </div>
          <div className="shrink-0 rounded-full border bg-background/80 px-4 py-2 text-center backdrop-blur">
            <div className="text-2xl font-serif font-bold tabular-nums">{pct}%</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              On track
            </div>
          </div>
        </div>
        <Progress value={pct} className="mt-3 h-2" />
        {steps.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {currentIdx === -1
              ? `All ${steps.length} steps done — you've finished the whole path.`
              : `Step ${currentIdx + 1} of ${steps.length} is next.`}
          </p>
        )}
      </div>

      {steps.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Building your recommended path…
        </div>
      ) : (
        <ol className="pl-0">
          {steps.map((step, i) => (
            <StepRow
              key={step.key}
              step={step}
              index={i}
              isCurrent={i === currentIdx}
              isLast={i === steps.length - 1}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
