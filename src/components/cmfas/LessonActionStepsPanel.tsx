import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useLessonActionStepProgress } from '@/hooks/useLessonActionStepProgress';
import type { LessonActionStep } from '@/hooks/useProducts';

interface LessonActionStepsPanelProps {
  steps: LessonActionStep[];
  productId: string;
  videoId: string;
}

/**
 * Renders the "Your action steps" panel at the top of a CMFAS lesson.
 * Designed to be impossible to scroll past — the boss's explicit ask is that
 * learners can't skim past the real actions and just hit Mark complete.
 *
 * Consumers gate their own Mark complete button via
 * `useLessonActionStepProgress(...).allCompleted(steps.map(s => s.id))`.
 */
export function LessonActionStepsPanel({
  steps,
  productId,
  videoId,
}: LessonActionStepsPanelProps) {
  const { isStepCompleted, toggleStep, completedCount } = useLessonActionStepProgress(
    productId,
    videoId,
  );

  if (steps.length === 0) return null;

  const total = steps.length;
  const allDone = completedCount >= total;

  if (allDone) {
    return (
      <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          All action steps complete — finish the lesson
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Action steps for this lesson"
      className="overflow-hidden rounded-xl border-2 border-cyan-200 bg-cyan-50/40 dark:border-cyan-800/40 dark:bg-cyan-950/10"
    >
      <header className="flex items-center justify-between border-b border-cyan-200/60 bg-cyan-100/40 px-4 py-2.5 dark:border-cyan-800/30 dark:bg-cyan-950/20">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
          Your action steps
        </p>
        <p className="text-xs tabular-nums text-cyan-700/80 dark:text-cyan-300/80">
          {completedCount} of {total}
        </p>
      </header>

      <ul className="divide-y divide-cyan-200/40 dark:divide-cyan-800/20">
        {steps.map((step, index) => {
          const checked = isStepCompleted(step.id);
          const hasLink = Boolean(step.url);
          return (
            <li key={step.id}>
              <div
                className={cn(
                  'flex items-start gap-3 px-4 py-3 transition-colors sm:gap-4',
                  checked ? 'bg-transparent' : 'hover:bg-cyan-100/30 dark:hover:bg-cyan-950/20',
                )}
              >
                <Checkbox
                  id={`step-${step.id}`}
                  checked={checked}
                  onCheckedChange={() => toggleStep(step.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 border-cyan-400 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                  aria-label={`Mark "${step.title}" as ${checked ? 'not done' : 'done'}`}
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`step-${step.id}`}
                    className={cn(
                      'cursor-pointer text-sm font-medium leading-snug',
                      checked
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground',
                    )}
                  >
                    <span className="mr-2 font-semibold text-cyan-700 dark:text-cyan-300 tabular-nums">
                      {index + 1}.
                    </span>
                    {step.title}
                  </label>
                  {step.hint && (
                    <p
                      className={cn(
                        'mt-0.5 text-xs leading-relaxed',
                        checked ? 'text-muted-foreground/70' : 'text-muted-foreground',
                      )}
                    >
                      {step.hint}
                    </p>
                  )}
                  {(step.minutes || step.outcome) && !checked && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {step.minutes != null && <span className="tabular-nums">~{step.minutes} min</span>}
                      {step.minutes != null && step.outcome && <span className="mx-1.5">·</span>}
                      {step.outcome && <span>After this: {step.outcome}</span>}
                    </p>
                  )}
                  {step.socialProof && !checked && (
                    <p className="mt-1 text-[11px] italic text-muted-foreground/80">
                      {step.socialProof}
                    </p>
                  )}
                  {hasLink && (
                    <a
                      href={step.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-cyan-700 hover:underline dark:text-cyan-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open link
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-cyan-200/60 bg-cyan-100/20 px-4 py-2 text-[11px] text-cyan-700/80 dark:border-cyan-800/30 dark:bg-cyan-950/10 dark:text-cyan-300/80">
        Complete every step before finishing this lesson.
      </p>
    </section>
  );
}
