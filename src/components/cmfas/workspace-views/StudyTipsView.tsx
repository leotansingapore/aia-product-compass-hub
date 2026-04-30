import {
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cmfasRoom } from '../cmfasTheme';

const STRATEGY_BULLETS: ReadonlyArray<string> = [
  'Do all 1,261 iLearn questions, plus another 200 from repeated topics.',
  'Do every SCI chapter checkpoint question.',
  'Do 4–5 SCI mock papers.',
  'Watch the recorded lecture tutorials halfway through the question bank.',
];

const RESOURCES: ReadonlyArray<{ label: string; href?: string; hint: string }> = [
  { label: 'iLearn portal (iRecruit)', href: 'https://joinus.aia.com.sg/app/login', hint: 'The canonical question bank.' },
  { label: 'CMFAS chatbot · @cmfas_bot', href: 'https://t.me/cmfas_bot', hint: '24/7 explainer for any question.' },
  { label: 'SCI key concepts + textbooks', href: 'https://drive.google.com/drive/folders/1zPgxvcCkB7WKaIhDYPi1PYKLamUca2CQ', hint: 'Reference, not required reading.' },
  { label: 'Flashcards (Revisely)', hint: 'Decks per paper — see below.' },
  { label: 'SCI chapter checkpoint questions', hint: 'Inside the SCI student account.' },
  { label: 'SCI mock exam', hint: 'Run 4–5 times max — questions repeat.' },
];

const DAILY_STEPS: ReadonlyArray<{ title: string; body: string; icon: React.ComponentType<{ className?: string }> }> = [
  {
    title: 'Step 1 · Start a daily routine',
    icon: ClipboardList,
    body:
      'No need to read the textbook cover to cover. Drill the iLearn questions in batches of 25, aiming for 100–150 a day — about 2–3 hours of studying. Cap each question at 2 minutes. Log your daily count in your phone notes so progress is visible.',
  },
  {
    title: 'Step 2 · Gain understanding',
    icon: BookOpen,
    body:
      "Practising alone isn't enough. Use the speed reference (the magnifying-glass icon inside iLearn) and the post-question explanations to understand why each answer is right. For deeper context, ask the chatbot or check the key-concepts PDF.",
  },
  {
    title: 'Step 3 · Build memory retention',
    icon: Brain,
    body:
      'Some questions are hard to remember — math with workings, exact figures, technical definitions. Copy those questions into a personal doc. Paste in the chatbot answer or key-concept text alongside. Use the flashcards for reinforcement on the move.',
  },
  {
    title: 'Step 4 · Develop accuracy',
    icon: Target,
    body:
      "By the end of week 1, repeat questions start clicking. New ones in the same topic also start clicking — that's the explanations doing their work. Keep the cycle running.",
  },
  {
    title: 'Step 5 · Increase exam stamina',
    icon: Timer,
    body:
      'Push session size: 50 questions, then 100. Time yourself against the real exam window. Daily output should creep up to 150–200 questions as confidence grows.',
  },
  {
    title: 'Step 6 · Book the exam',
    icon: CalendarCheck,
    body:
      'After ~800 questions, book a date roughly one week out. Use the remaining runway for the last 500 questions, repeats, and the SCI mock papers (max 5 attempts — questions cycle). Move into the SCI chapter checkpoints once the iLearn bank is done. Log every score so progress is visible.',
  },
  {
    title: 'Step 7 · Day before the exam',
    icon: ListChecks,
    body:
      "Sleep early. Open the personal notes doc and delete anything fully internalised. What's left should be the essentials still slipping — that becomes the morning-of revision sheet.",
  },
  {
    title: 'Step 8 · Exam day',
    icon: Trophy,
    body:
      'Use the flashcards and the trimmed notes on the train or bus. In the exam itself, read each question carefully and check workings + answers at least twice end-to-end before submitting.',
  },
];

const FLASHCARD_DECKS: ReadonlyArray<{ paper: string; url: string }> = [
  { paper: 'M9', url: 'https://revisely.com/flashcards/decks/PnO9i6' },
  { paper: 'M9A', url: 'https://revisely.com/flashcards/decks/CVxXJ7' },
  { paper: 'HI', url: 'https://revisely.com/flashcards/decks/4Bz9fm' },
  { paper: 'RES5', url: 'https://revisely.com/flashcards/decks/1KxDpT' },
];

const PRACTICE_TACTICS: ReadonlyArray<string> = [
  'Read each question carefully and pick the best fit, not the first plausible one.',
  'Use the speed reference (magnifying-glass icon) to jump to the relevant textbook section.',
  "Don't memorise blindly — read the supporting chapter so the concept actually sticks.",
  'Always read the post-question explanation, especially on wrong answers.',
];

const KPIS: ReadonlyArray<{ label: string; value: string; hint: string }> = [
  { label: 'Question target', value: '~1,000', hint: 'Clear the full bank before booking.' },
  { label: 'Time per question', value: '~2 min', hint: 'Total study time ≈ 30 hrs per paper.' },
  { label: 'Ideal pace', value: '1 paper / 2 weeks', hint: 'Minimum 1 per month; relaxed 1 per 2 months.' },
];

export function StudyTipsView() {
  return (
    <div className="space-y-8">
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <header>
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
          Study tips
        </p>
        <h1 className={cn('mt-2 font-serif text-3xl font-bold sm:text-4xl', cmfasRoom.text)}>
          Pass M9, M9A and HI in a month.
        </h1>
        <p className={cn('mt-2 max-w-2xl text-sm', cmfasRoom.textMuted)}>
          By <span className={cmfasRoom.text}>Christopher Ng</span> — cleared three CMFAS papers in 30 days. The exact strategy he used,
          step by step. The papers earn the licence; this guide earns the licence fast.
        </p>
      </header>

      {/* ─── Strategy + How long ───────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div
          className={cn(
            'rounded-2xl border p-5 lg:col-span-2',
            cmfasRoom.surface,
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2', cmfasRoom.brassBorder)}>
              <Sparkles className={cn('h-5 w-5', cmfasRoom.brassText)} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={cn('text-base font-semibold', cmfasRoom.text)}>Strategy at a glance</h2>
              <ul className={cn('mt-3 space-y-1.5 text-sm leading-relaxed', cmfasRoom.text)}>
                {STRATEGY_BULLETS.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', cmfasRoom.brassText)} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={cn('rounded-2xl border p-5', cmfasRoom.surface)}>
          <div className="flex items-start gap-3">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2', cmfasRoom.brassBorder)}>
              <Timer className={cn('h-5 w-5', cmfasRoom.brassText)} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={cn('text-base font-semibold', cmfasRoom.text)}>How long per paper?</h2>
              <p className={cn('mt-2 text-sm leading-relaxed', cmfasRoom.textMuted)}>
                3–4 weeks on average. Run this strategy for 3–4 hours a day and one paper falls in two weeks.
                Run it for an hour a day and the timeline stretches to 4–5 weeks. Pace is yours to set.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Resources ─────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2">
          <FileText className={cn('h-4 w-4', cmfasRoom.brassText)} />
          <h2 className={cn('text-base font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
            Resources
          </h2>
        </div>
        <p className={cn('mt-1 max-w-2xl text-xs', cmfasRoom.textMuted)}>
          The textbooks live in the Drive folder, but they are <span className={cn('font-semibold', cmfasRoom.text)}>not required reading</span>.
          Time is far better spent in the question bank — read the textbook only when an explanation isn't enough.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r) => {
            const inner = (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold', cmfasRoom.text)}>{r.label}</p>
                  <p className={cn('mt-0.5 text-xs', cmfasRoom.textMuted)}>{r.hint}</p>
                </div>
                {r.href && <ExternalLink className={cn('h-3.5 w-3.5 shrink-0', cmfasRoom.textFaint)} />}
              </div>
            );
            return r.href ? (
              <a
                key={r.label}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  cmfasRoom.surface,
                  cmfasRoom.surfaceHover,
                )}
              >
                {inner}
              </a>
            ) : (
              <div key={r.label} className={cn('rounded-xl border p-4', cmfasRoom.surface)}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 8-step routine ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2">
          <Lightbulb className={cn('h-4 w-4', cmfasRoom.brassText)} />
          <h2 className={cn('text-base font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
            The 8-step routine
          </h2>
        </div>
        <ol className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {DAILY_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className={cn('rounded-2xl border p-4', cmfasRoom.surface)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2', cmfasRoom.brassBorder)}>
                    <Icon className={cn('h-4 w-4', cmfasRoom.brassText)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={cn('text-sm font-semibold', cmfasRoom.text)}>{step.title}</h3>
                    <p className={cn('mt-1.5 text-xs leading-relaxed', cmfasRoom.textMuted)}>{step.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ─── KPIs ──────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2">
          <Target className={cn('h-4 w-4', cmfasRoom.brassText)} />
          <h2 className={cn('text-base font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
            Targets to hit
          </h2>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {KPIS.map((k) => (
            <div key={k.label} className={cn('rounded-2xl border p-4', cmfasRoom.surface)}>
              <p className={cn('text-[10px] font-bold uppercase tracking-[0.15em]', cmfasRoom.brassText)}>
                {k.label}
              </p>
              <p className={cn('mt-1 font-serif text-2xl font-bold tabular-nums', cmfasRoom.text)}>
                {k.value}
              </p>
              <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>{k.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Practice tactics + suggested order ────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={cn('rounded-2xl border p-5', cmfasRoom.surface)}>
          <div className="flex items-center gap-2">
            <Brain className={cn('h-4 w-4', cmfasRoom.brassText)} />
            <h2 className={cn('text-sm font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
              Inside Practice Mode
            </h2>
          </div>
          <ul className={cn('mt-3 space-y-1.5 text-sm leading-relaxed', cmfasRoom.text)}>
            {PRACTICE_TACTICS.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', cmfasRoom.brassText)} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={cn('rounded-2xl border p-5', cmfasRoom.surface)}>
          <div className="flex items-center gap-2">
            <CalendarCheck className={cn('h-4 w-4', cmfasRoom.brassText)} />
            <h2 className={cn('text-sm font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
              Suggested paper order
            </h2>
          </div>
          <p className={cn('mt-3 text-sm leading-relaxed', cmfasRoom.text)}>
            Start with <span className={cn('font-semibold', cmfasRoom.text)}>M9</span>. Then M9A, then HI, then RES5.
            Clear each one before moving on — the foundation each paper lays makes the next one feel lighter.
          </p>
          <p className={cn('mt-3 text-xs', cmfasRoom.textMuted)}>
            Daily habit: use small pockets of time. 1–2 hours of consistent practice beats an occasional 5-hour session.
          </p>
        </div>
      </section>

      {/* ─── Flashcards ────────────────────────────────────────────────── */}
      <section className={cn('rounded-2xl border p-5', cmfasRoom.surface)}>
        <div className="flex items-start gap-3">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
            <Sparkles className={cn('h-5 w-5', cmfasRoom.brassText)} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={cn('text-base font-semibold', cmfasRoom.text)}>Flashcards</h2>
            <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
              Drilled from the iLearn pool, the chatbot, the textbook, and the SCI key-concepts pages. Use them
              after some iLearn practice — quick revision on the move and the hour before the exam, not a memory drill.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FLASHCARD_DECKS.map((deck) => (
                <a
                  key={deck.paper}
                  href={deck.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                    cmfasRoom.brassBorderSoft,
                    cmfasRoom.text,
                    cmfasRoom.brassBgHover,
                  )}
                >
                  <span>{deck.paper}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Communication / next-steps ─────────────────────────────────── */}
      <section className={cn('rounded-2xl border p-5', cmfasRoom.surface)}>
        <h2 className={cn('text-sm font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
          Keep the team in the loop
        </h2>
        <ul className={cn('mt-3 space-y-1.5 text-sm leading-relaxed', cmfasRoom.textMuted)}>
          <li>Modules unlock as papers fall — book the paper, drop a note, the next tier opens.</li>
          <li>Update the FINternship support chat after booking each exam or starting a new paper.</li>
          <li>Anything blocked or unclear — raise it in the support chat. Quiet doesn't get help.</li>
        </ul>
      </section>
    </div>
  );
}
