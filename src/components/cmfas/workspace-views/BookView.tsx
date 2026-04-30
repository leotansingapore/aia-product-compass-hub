import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cmfasRoom } from '../cmfasTheme';

const PAPER_ORDER: ReadonlyArray<{ paper: string; tagline: string }> = [
  { paper: 'M9', tagline: 'Life insurance + ILPs. The foundation — start here.' },
  { paper: 'M9A', tagline: 'Structured products + derivatives.' },
  { paper: 'HI', tagline: 'Health insurance.' },
  { paper: 'RES5', tagline: 'Rules, ethics + skills. Cleanest to take last — pulls everything together.' },
];

const READINESS_CHECKS: ReadonlyArray<string> = [
  'Cleared the full iLearn bank for the paper (~1,000 questions).',
  "Scoring consistently above the pass mark on Premium Papers under timed conditions.",
  'Done at least one full SCI mock paper end-to-end.',
];

export function BookView() {
  return (
    <div className="space-y-8">
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <header>
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
          Book a paper
        </p>
        <h1 className={cn('mt-2 font-serif text-3xl font-bold sm:text-4xl', cmfasRoom.text)}>
          Lock in the date.
        </h1>
        <p className={cn('mt-2 max-w-2xl text-sm', cmfasRoom.textMuted)}>
          A real exam date is the single biggest thing that pulls a learner through the question bank.
          Aim for one paper every two weeks — minimum one a month.
        </p>
      </header>

      {/* ─── Two big actions ───────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <a
          href="https://www.scicollege.org.sg/Exam/ExamRegistration"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group rounded-2xl border-2 p-5 transition-colors',
            cmfasRoom.brassBorder,
            cmfasRoom.surfaceHover,
            cmfasRoom.surface,
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
              <CalendarClock className={cn('h-6 w-6', cmfasRoom.brassText)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className={cn('text-base font-semibold', cmfasRoom.text)}>Check the SCI exam schedule</h2>
                <ExternalLink className={cn('h-3 w-3', cmfasRoom.textFaint)} />
              </div>
              <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
                See which sittings are open in the next few weeks before committing to a date.
              </p>
              <p
                className={cn(
                  'mt-3 inline-flex items-center gap-1 text-xs font-semibold',
                  cmfasRoom.brassText,
                )}
              >
                Open the schedule
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </p>
            </div>
          </div>
        </a>

        <a
          href="https://tinyurl.com/CMFASregistration2025"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group rounded-2xl border-2 p-5 transition-colors',
            cmfasRoom.brassBorder,
            cmfasRoom.brassBgSoft,
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 bg-card', cmfasRoom.brassBorder)}>
              <CalendarCheck className={cn('h-6 w-6', cmfasRoom.brassText)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className={cn('text-base font-semibold', cmfasRoom.text)}>Register for an exam</h2>
                <ExternalLink className={cn('h-3 w-3', cmfasRoom.textFaint)} />
              </div>
              <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
                The shared registration link the team uses. First attempt of each paper is on us.
              </p>
              <p
                className={cn(
                  'mt-3 inline-flex items-center gap-1 text-xs font-semibold',
                  cmfasRoom.brassText,
                )}
              >
                Start a registration
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </p>
            </div>
          </div>
        </a>
      </section>

      {/* ─── Cadence + suggested order ─────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={cn('rounded-2xl border p-5', cmfasRoom.surface)}>
          <div className="flex items-center gap-2">
            <Target className={cn('h-4 w-4', cmfasRoom.brassText)} />
            <h3 className={cn('text-sm font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
              The right cadence
            </h3>
          </div>
          <ul className={cn('mt-3 space-y-1.5 text-sm leading-relaxed', cmfasRoom.text)}>
            <li className="flex items-start gap-2">
              <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', cmfasRoom.brassText)} />
              <span>
                <span className="font-semibold">Ideal:</span> one paper every two weeks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', cmfasRoom.brassText)} />
              <span>
                <span className="font-semibold">Minimum:</span> one paper a month.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', cmfasRoom.brassText)} />
              <span>
                <span className="font-semibold">Relaxed:</span> one paper every two months.
              </span>
            </li>
          </ul>
          <p className={cn('mt-3 text-xs', cmfasRoom.textMuted)}>
            Each paper is roughly 20–30 hours of study. The faster the cadence, the easier each subsequent paper feels.
          </p>
        </div>

        <div className={cn('rounded-2xl border p-5 lg:col-span-2', cmfasRoom.surface)}>
          <div className="flex items-center gap-2">
            <CalendarCheck className={cn('h-4 w-4', cmfasRoom.brassText)} />
            <h3 className={cn('text-sm font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
              Suggested order
            </h3>
          </div>
          <ol className="mt-3 space-y-2">
            {PAPER_ORDER.map((p, i) => (
              <li key={p.paper} className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums',
                    cmfasRoom.brassBorder,
                    cmfasRoom.brassText,
                  )}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold', cmfasRoom.text)}>{p.paper}</p>
                  <p className={cn('text-xs', cmfasRoom.textMuted)}>{p.tagline}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Readiness check ───────────────────────────────────────────── */}
      <section className={cn('rounded-2xl border p-5', cmfasRoom.surface)}>
        <h3 className={cn('text-sm font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
          Ready to book? Check these first.
        </h3>
        <ul className={cn('mt-3 space-y-1.5 text-sm leading-relaxed', cmfasRoom.text)}>
          {READINESS_CHECKS.map((c) => (
            <li key={c} className="flex items-start gap-2">
              <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', cmfasRoom.brassText)} />
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <p className={cn('mt-3 text-xs', cmfasRoom.textMuted)}>
          Don't wait for a perfect score — book once the readiness checks land.
          Fear of booking is what stretches a 4-week paper into 8.
        </p>
      </section>

      {/* ─── Help shortcut ─────────────────────────────────────────────── */}
      <section
        className={cn(
          'rounded-2xl border p-5',
          cmfasRoom.surface,
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2', cmfasRoom.brassBorder)}>
            <MessageCircle className={cn('h-5 w-5', cmfasRoom.brassText)} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={cn('text-sm font-semibold', cmfasRoom.text)}>Stuck on which paper to book next?</h3>
            <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
              Drop a note in the FINternship support chat or message{' '}
              <a
                href="https://t.me/cmfas_bot"
                target="_blank"
                rel="noopener noreferrer"
                className={cn('font-semibold underline underline-offset-2', cmfasRoom.brassText)}
              >
                @cmfas_bot on Telegram
              </a>{' '}
              for a live readiness check on the question-bank score history.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
