import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import {
  getAllWeeks as getF60Weeks,
  TOTAL_DAYS as F60_TOTAL_DAYS,
} from "@/features/first-60-days/content";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { loadAllAssignments } from "@/features/first-60-days/assignments";
import {
  getAllWeeks as getPMWeeks,
  WEEK_META as PM_WEEK_META,
  TOTAL_DAYS as PM_TOTAL_DAYS,
} from "@/features/product-mastery-track/content";
import { useProductMasteryProgress } from "@/hooks/product-mastery-track/useProductMasteryProgress";

const ASSIGNMENTS_PRODUCT_ID = "first-60-days-assignments";

// Exam order the student studies in: M9 -> M9A -> RES5 -> HI.
const CMFAS_EXAMS = [
  { moduleId: "m9", label: "M9 — Life Insurance" },
  { moduleId: "m9a", label: "M9A — Life Insurance (Advanced)" },
  { moduleId: "res5", label: "RES5 — Rules & Regulations" },
  { moduleId: "hi", label: "HI — Health Insurance" },
] as const;

type Row = {
  key: string;
  label: string;
  done: boolean;
  to?: string;
  extra?: { to: string; label: string };
  /** When present the tick becomes an interactive checkbox (used for the
   *  CMFAS papers, which a student passes at an external test centre and so
   *  must mark off by hand). */
  onToggle?: () => void;
};

const CMFAS_PASSED_KEY = (userId: string) => `cmfas-exams-passed-${userId}`;

function readCmfasPassed(userId: string | undefined): Set<string> {
  if (!userId || typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(CMFAS_PASSED_KEY(userId));
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

function writeCmfasPassed(userId: string, set: Set<string>) {
  try {
    localStorage.setItem(CMFAS_PASSED_KEY(userId), JSON.stringify([...set]));
  } catch {
    // Quota / private-mode failures are non-fatal.
  }
}

function useAssignmentSubmissionKeys(userId: string | undefined) {
  return useQuery({
    queryKey: ["checklist-assignment-submissions", userId],
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

/** A "checkbox" tick. Derived rows are read-only (ticks itself when the work
 *  is done); interactive rows render a hoverable empty box the student taps. */
function Tick({ done, interactive }: { done: boolean; interactive?: boolean }) {
  return done ? (
    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
  ) : (
    <span
      className={cn(
        "block h-4 w-4 shrink-0 rounded-[5px] border-2 border-muted-foreground/40",
        interactive && "border-primary/50",
      )}
    />
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  done,
  total,
  rows,
  headerTo,
  defaultOpen,
}: {
  icon: typeof GraduationCap;
  title: string;
  subtitle: string;
  done: number;
  total: number;
  rows: Row[];
  headerTo: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done >= total;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border bg-card">
      <CollapsibleTrigger className="flex w-full items-center gap-3 p-3 text-left sm:p-4">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            complete ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-primary/10 text-primary",
          )}
        >
          {complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold sm:text-base">{title}</h3>
            <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
              {done}/{total}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          <Progress value={pct} className="mt-2 h-1.5" />
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 border-t px-2 py-2 sm:px-3">
          {rows.map((row) => {
            const labelSpan = (
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-sm",
                  row.done
                    ? "text-muted-foreground line-through decoration-muted-foreground/40"
                    : "text-foreground",
                )}
              >
                {row.label}
              </span>
            );
            return (
              <div key={row.key} className="flex items-center gap-1">
                {row.onToggle ? (
                  <button
                    type="button"
                    onClick={row.onToggle}
                    aria-pressed={row.done}
                    className="flex shrink-0 items-center rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60"
                    title={row.done ? "Mark as not passed yet" : "Mark as passed"}
                  >
                    <Tick done={row.done} interactive />
                  </button>
                ) : null}
                {row.to ? (
                  <Link
                    to={row.to}
                    className={cn(
                      "flex flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60",
                      row.onToggle && "pl-0",
                    )}
                  >
                    {!row.onToggle && <Tick done={row.done} />}
                    {labelSpan}
                  </Link>
                ) : (
                  <div className="flex flex-1 items-center gap-2.5 px-2 py-1.5">
                    {!row.onToggle && <Tick done={row.done} />}
                    {labelSpan}
                  </div>
                )}
                {row.extra && (
                  <Link
                    to={row.extra.to}
                    className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:underline"
                  >
                    {row.extra.label}
                  </Link>
                )}
              </div>
            );
          })}
          <Link
            to={headerTo}
            className="mt-1 flex items-center justify-center rounded-lg bg-muted/50 px-2 py-1.5 text-xs font-semibold text-primary hover:bg-muted"
          >
            Open {title}
          </Link>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function StudentProgressChecklist() {
  const { user } = useSimplifiedAuth();
  const userId = user?.id;

  // --- First 60 Days (+ daily quizzes) ---
  const f60Progress = useFirst60DaysProgress();
  const f60Weeks = useMemo(() => getF60Weeks(), []);
  const f60 = useMemo(() => {
    const rows: Row[] = f60Weeks.map((w) => {
      const weekDone = w.days.filter((d) => f60Progress.isDayComplete(d.dayNumber)).length;
      const allDone = w.days.length > 0 && weekDone === w.days.length;
      const entry = w.days.find((d) => !f60Progress.isDayComplete(d.dayNumber)) ?? w.days[0];
      return {
        key: `f60-w${w.weekNumber}`,
        label: `Week ${w.weekNumber}: ${w.title} (${weekDone}/${w.days.length})`,
        done: allDone,
        to: `/learning-track/first-60-days/day/${entry.dayNumber}`,
      };
    });
    return { rows, done: f60Progress.completedCount(), total: F60_TOTAL_DAYS };
  }, [f60Weeks, f60Progress]);

  // --- Assignments ---
  const { data: assignments } = useAssignmentsList();
  const { data: submittedKeys } = useAssignmentSubmissionKeys(userId);
  const asg = useMemo(() => {
    const list = assignments ?? [];
    const rows: Row[] = list.map((a) => {
      const done = !!submittedKeys?.has(a.frontmatter.status_key);
      return {
        key: `asg-${a.slug}`,
        label: `${a.frontmatter.order}. ${a.frontmatter.title}`,
        done,
        to: `/learning-track/pre-rnf/assignments/${a.frontmatter.url_slug ?? a.slug}`,
      };
    });
    return { rows, done: rows.filter((r) => r.done).length, total: rows.length };
  }, [assignments, submittedKeys]);

  // --- Product Mastery & Question Banks ---
  const pmProgress = useProductMasteryProgress();
  const pmWeeks = useMemo(() => getPMWeeks(), []);
  const pm = useMemo(() => {
    let daysDone = 0;
    const rows: Row[] = pmWeeks.map((w) => {
      const weekDone = w.days.filter((d) => pmProgress.isDayComplete(d.dayNumber)).length;
      daysDone += weekDone;
      const allDone = w.days.length > 0 && weekDone === w.days.length;
      const entry = w.days.find((d) => !pmProgress.isDayComplete(d.dayNumber)) ?? w.days[0];
      const meta = PM_WEEK_META[w.weekNumber];
      const slug = meta?.productSlug;
      return {
        key: `pm-w${w.weekNumber}`,
        label: `${meta?.title ?? `Week ${w.weekNumber}`} (${weekDone}/${w.days.length})`,
        done: allDone,
        to: `/learning-track/product-mastery/day/${entry.dayNumber}`,
        extra: slug ? { to: `/product/${slug}/study`, label: "Question bank" } : undefined,
      };
    });
    return { rows, done: daysDone, total: PM_TOTAL_DAYS };
  }, [pmWeeks, pmProgress]);

  // --- CMFAS Exams (passed at an external test centre → student self-ticks) ---
  const [cmfasPassed, setCmfasPassed] = useState<Set<string>>(() => readCmfasPassed(userId));
  // Re-hydrate once auth resolves (userId starts undefined on first render).
  useEffect(() => {
    setCmfasPassed(readCmfasPassed(userId));
  }, [userId]);
  const toggleCmfas = (moduleId: string) => {
    setCmfasPassed((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      if (userId) writeCmfasPassed(userId, next);
      return next;
    });
  };
  const cmfas = useMemo(() => {
    const rows: Row[] = CMFAS_EXAMS.map((e) => ({
      key: `cmfas-${e.moduleId}`,
      label: e.label,
      done: cmfasPassed.has(e.moduleId),
      to: `/cmfas/module/${e.moduleId}`,
      onToggle: () => toggleCmfas(e.moduleId),
    }));
    return { rows, done: rows.filter((r) => r.done).length, total: rows.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmfasPassed]);

  const totalDone = f60.done + asg.done + pm.done + cmfas.done;
  const totalItems = f60.total + asg.total + pm.total + cmfas.total;
  const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Your Pre-RNF Roadmap
            </p>
            <h2 className="mt-1 font-serif text-lg font-bold leading-tight sm:text-2xl">
              Everything you need to clear, in one checklist.
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Each item ticks itself the moment you finish the real work — nothing to mark off by hand.
            </p>
          </div>
          <div className="shrink-0 rounded-full border bg-background/80 px-4 py-2 text-center backdrop-blur">
            <div className="text-2xl font-serif font-bold tabular-nums">{overallPct}%</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Complete
            </div>
          </div>
        </div>
        <Progress value={overallPct} className="mt-3 h-2" />
      </div>

      <Section
        icon={CalendarDays}
        title="First 60 Days + quizzes"
        subtitle="Day-by-day curriculum. Each day unlocks after its quiz passes."
        done={f60.done}
        total={f60.total}
        rows={f60.rows}
        headerTo="/learning-track/first-60-days"
        defaultOpen={f60.done < f60.total}
      />
      <Section
        icon={ClipboardList}
        title="Assignments"
        subtitle="Turn the study into artifacts that prove you're field-ready."
        done={asg.done}
        total={asg.total}
        rows={asg.rows}
        headerTo="/learning-track/pre-rnf/assignments"
        defaultOpen={asg.total > 0 && asg.done < asg.total}
      />
      <Section
        icon={Sparkles}
        title="Question Banks & Product Mastery"
        subtitle="7 core products, 5 days each, with a question bank per product."
        done={pm.done}
        total={pm.total}
        rows={pm.rows}
        headerTo="/learning-track/product-mastery"
        defaultOpen={false}
      />
      <Section
        icon={GraduationCap}
        title="CMFAS Exams"
        subtitle="M9, M9A, RES5, HI — clear all four papers to get licensed."
        done={cmfas.done}
        total={cmfas.total}
        rows={cmfas.rows}
        headerTo="/cmfas-exams"
        defaultOpen={cmfas.done < cmfas.total}
      />
    </div>
  );
}
