import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { cmfasTone } from './cmfasTheme';

/**
 * The 6 readiness steps defined in CMFASOnboardingWizard. Kept in sync by
 * reusing the same localStorage-backed useChecklistProgress — ticking
 * something here OR in the wizard both update the same source of truth.
 */
const READY_STEPS: Array<{ id: string; title: string; hint: string }> = [
  {
    id: 'welcome',
    title: 'Read the welcome briefing',
    hint: 'What CMFAS is, how you pass, why it matters.',
  },
  {
    id: 'create-student-account',
    title: 'Create your SCI College student account',
    hint: 'Official identity for every paper you sit.',
  },
  {
    id: 'access-question-bank',
    title: 'Unlock the question bank (iRecruit)',
    hint: 'The #1 step learners skip. Do it today.',
  },
  {
    id: 'understand-costs-timeline',
    title: 'Know the costs + timeline',
    hint: 'What each exam costs and how long it really takes.',
  },
  {
    id: 'register-m9-exam',
    title: 'Register for your first paper (M9)',
    hint: 'A real booked date turns "someday" into "in 3 weeks".',
  },
  {
    id: 'first-practice',
    title: 'Do your first 10 practice questions',
    hint: 'You learn faster by doing, not by reading.',
  },
];

/**
 * Promotes the 6 Ready-layer steps (previously buried inside the Onboarding
 * module) to the top of the CMFAS hub. Coach-voice copy, no "locked" /
 * "denied" language.
 */
export function ReadyChecklistCard() {
  const { isItemCompleted } = useChecklistProgress();
  const completed = READY_STEPS.filter((s) => isItemCompleted(s.id)).length;
  const total = READY_STEPS.length;
  const allDone = completed >= total;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border-2',
        allDone
          ? cn(cmfasTone.positiveBorder, cmfasTone.positiveBg)
          : cn(cmfasTone.accentBorder, cmfasTone.accentBgSoft),
      )}
    >
      <div className={cn('flex items-center justify-between gap-3 border-b px-5 py-3', allDone ? cmfasTone.positiveBorder : cmfasTone.accentBorderSoft)}>
        <div>
          <p className={cn('text-[11px] font-semibold uppercase tracking-wider', allDone ? cmfasTone.positiveText : cmfasTone.accentText)}>
            {allDone ? 'Ready to study' : 'Get ready'}
          </p>
          <p className="mt-0.5 text-sm text-foreground">
            {allDone ? (
              <>All 6 setup steps done — nothing blocking you now.</>
            ) : (
              <>
                <span className="font-semibold tabular-nums">{completed} of {total}</span>{' '}
                setup steps done — {completed === 0 ? "let's start here" : "nice momentum"}.
              </>
            )}
          </p>
        </div>
        <Link
          to="/cmfas/module/onboarding"
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
            'hover:bg-background',
          )}
        >
          {allDone ? 'Review' : 'Open setup'}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ul className="divide-y divide-border/60">
        {READY_STEPS.map((step, idx) => {
          const done = isItemCompleted(step.id);
          return (
            <li key={step.id}>
              <Link
                to="/cmfas/module/onboarding"
                className={cn(
                  'flex items-start gap-3 px-5 py-3 transition-colors',
                  done ? 'opacity-70' : 'hover:bg-muted/30',
                )}
              >
                <div className="shrink-0">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm leading-snug',
                      done ? 'text-muted-foreground line-through' : 'font-medium text-foreground',
                    )}
                  >
                    <span className={cn('mr-1.5 tabular-nums', done ? '' : cmfasTone.accentText)}>
                      {idx + 1}.
                    </span>
                    {step.title}
                  </p>
                  {!done && <p className="mt-0.5 text-xs text-muted-foreground">{step.hint}</p>}
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
