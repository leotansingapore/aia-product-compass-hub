import { memo } from "react";
import { ArrowRight, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CMFASGettingStartedProminentProps {
  /** When true, the large “required” card is hidden; a slim confirmation is shown if `showWhenComplete` is true. */
  complete: boolean;
  showWhenComplete?: boolean;
  /** 0–100 for onboarding course progress (videos). */
  progressPercent: number;
  onOpenModule: () => void;
}

/**
 * iRecruit-style “pending task” callout: Getting Started is mandatory before exam modules.
 * Full playbooks, registration steps, and tutorials stay inside the Onboarding module.
 */
export const CMFASGettingStartedProminent = memo(function CMFASGettingStartedProminent({
  complete,
  showWhenComplete = true,
  progressPercent,
  onOpenModule,
}: CMFASGettingStartedProminentProps) {
  if (complete) {
    if (!showWhenComplete) return null;
    return (
      <div
        className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-950/35 px-4 py-3 text-emerald-100/95 backdrop-blur-sm"
        role="status"
      >
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
        <p className="text-sm font-medium">Getting started complete. Exam modules are open below.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-amber-300/40 bg-gradient-to-br from-amber-950/60 via-amber-950/40 to-stone-950/80 p-5 shadow-[0_0_40px_-8px_rgba(251,191,36,0.25)] sm:p-6",
        "backdrop-blur-sm",
      )}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
            <Lock className="h-3 w-3" aria-hidden />
            Required
          </div>
          <h2 className="text-lg font-semibold leading-tight text-amber-50 sm:text-xl">
            Getting started
          </h2>
          <p className="max-w-prose text-sm text-amber-200/90">
            Finish this module before the four exam papers (M9, M9A, HI, RES5) unlock. Everything
            else—rules, SCI account, ILEARN, question bank, and chatbot access—is walked through
            there, in order.
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-amber-100/90 marker:text-amber-400/80">
            <li>Program expectations, study pace, and what unlocks as you pass exams.</li>
            <li>Register a SCI student account, iRecruit, and get into the ILEARN question bank.</li>
            <li>Book your papers (M9 first) and use the same tutorial track as the exam prep videos.</li>
          </ul>
          {progressPercent > 0 && progressPercent < 100 && (
            <p className="text-xs text-amber-200/70">
              In progress: <span className="tabular-nums font-medium">{Math.round(progressPercent)}%</span>{" "}
              of the onboarding path.
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end sm:pt-7">
          <Button
            type="button"
            size="lg"
            className="h-12 w-full gap-2 bg-amber-100 text-amber-950 hover:bg-white sm:min-w-[200px] sm:px-8"
            onClick={onOpenModule}
          >
            <Sparkles className="h-4 w-4" />
            Open getting started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
