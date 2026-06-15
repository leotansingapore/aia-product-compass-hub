import {
  BookOpen,
  BookX,
  Bot,
  Brain,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  Lightbulb,
  ListChecks,
  MessageCircle,
  Repeat,
  ScrollText,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { cmfasRoom } from '../cmfasTheme';

const STRATEGY_BULLETS: ReadonlyArray<string> = [
  'Spam the iRecruit bank: all 1,261 iLearn questions, plus another 200 from repeated topics.',
  'Skip the textbooks. Read an explanation only when a question stumps you.',
  'Do every SCI chapter checkpoint question.',
  'Do 4–5 SCI mock papers, but only after you book the exam.',
  'Watch the recorded lecture tutorials halfway through the question bank.',
];

const RESOURCES: ReadonlyArray<{ label: string; href?: string; to?: string; hint: string }> = [
  { label: 'SCI key concepts + textbooks', href: 'https://drive.google.com/drive/folders/1zPgxvcCkB7WKaIhDYPi1PYKLamUca2CQ', hint: 'Reference, not required reading.' },
  { label: 'SCI chapter checkpoint questions', hint: 'Inside the SCI student account.' },
  { label: 'SCI mock exam', hint: 'Only after you book the exam. Run 4–5 times max; questions repeat.' },
  { label: 'Lecture videos', to: '/cmfas-exams/lecture-videos', hint: 'Recorded SCI lectures by paper. Optional — most learners pass without watching.' },
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
      "Practising alone isn't enough. Use the speed reference (the magnifying-glass icon inside iLearn) and the post-question explanations to understand why each answer is right. Anything that won't click, paste into your AI coach (ChatGPT, NotebookLM, or @cmfas_bot) and have it explain and re-drill you, instead of re-reading the chapter.",
  },
  {
    title: 'Step 3 · Build memory retention',
    icon: Brain,
    body:
      'Some questions are hard to remember — math with workings, exact figures, technical definitions. Copy those questions into a personal doc and paste the chatbot answer or key-concept text alongside. That doc becomes the personal cheat-sheet for end-of-day revision.',
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
      'Skim the trimmed notes doc on the train or bus. In the exam itself, read each question carefully and check workings + answers at least twice end-to-end before submitting.',
  },
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

      {/* ─── The whole method, in three rules ─────────────────────────────
       *  Pinned directly under the hero so the core message is unmissable:
       *  drill questions, don't read textbooks, mock only after booking.
       */}
      <section
        className={cn(
          'rounded-2xl border-2 p-5 sm:p-6',
          cmfasRoom.brassBorder,
          'bg-primary/5',
        )}
      >
        <p className={cn('text-[10px] font-bold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
          Read this first
        </p>
        <h2 className={cn('mt-1 font-serif text-2xl font-bold leading-tight', cmfasRoom.text)}>
          Three rules. That's the whole exam.
        </h2>
        <p className={cn('mt-1.5 max-w-2xl text-sm', cmfasRoom.textMuted)}>
          Reading the textbook is the slow way to fail. You pass by drilling questions and getting an
          AI to explain the ones you miss.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className={cn('rounded-xl border p-4', cmfasRoom.surface)}>
            <div className="flex items-center gap-2">
              <Repeat className={cn('h-4 w-4 shrink-0', cmfasRoom.brassText)} />
              <h3 className={cn('text-sm font-semibold', cmfasRoom.text)}>1 · Spam the questions</h3>
            </div>
            <p className={cn('mt-1.5 text-xs leading-relaxed', cmfasRoom.textMuted)}>
              Drill iRecruit every day, 100–200 questions. The question bank is the real syllabus.
            </p>
          </div>
          <div className={cn('rounded-xl border p-4', cmfasRoom.surface)}>
            <div className="flex items-center gap-2">
              <BookX className={cn('h-4 w-4 shrink-0', cmfasRoom.brassText)} />
              <h3 className={cn('text-sm font-semibold', cmfasRoom.text)}>2 · Skip the textbooks</h3>
            </div>
            <p className={cn('mt-1.5 text-xs leading-relaxed', cmfasRoom.textMuted)}>
              Don't read cover to cover. Open a textbook only when an explanation won't make a concept click.
            </p>
          </div>
          <div className={cn('rounded-xl border p-4', cmfasRoom.surface)}>
            <div className="flex items-center gap-2">
              <CalendarClock className={cn('h-4 w-4 shrink-0', cmfasRoom.brassText)} />
              <h3 className={cn('text-sm font-semibold', cmfasRoom.text)}>3 · Book, then mock</h3>
            </div>
            <p className={cn('mt-1.5 text-xs leading-relaxed', cmfasRoom.textMuted)}>
              Book the exam after ~800 questions. Save the SCI mock papers for the final week before the date.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Book your next paper ─────────────────────────────────────────
       *  Surfaced at the top so the booking step is one click from the
       *  most-referenced page in the workspace. Sticking to a paper-every-
       *  fortnight cadence is the single biggest determinant of pace.
       */}
      <section
        className={cn(
          'rounded-2xl border-2 p-5',
          cmfasRoom.brassBorder,
          'bg-primary/5',
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
              <CalendarClock className={cn('h-5 w-5', cmfasRoom.brassText)} />
            </div>
            <div className="min-w-0">
              <p className={cn('text-[10px] font-bold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
                Lock the date
              </p>
              <h2 className={cn('mt-0.5 font-serif text-xl font-bold leading-tight sm:text-2xl', cmfasRoom.text)}>
                Book your next paper.
              </h2>
              <p className={cn('mt-1 max-w-xl text-sm', cmfasRoom.textMuted)}>
                A real exam date is the single biggest thing that pulls a learner through the question bank.
                Aim for one paper every two weeks.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end sm:shrink-0">
            <a
              href="https://www.scicollege.org.sg/Exam/ExamRegistration"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                cmfasRoom.brassBorder,
                cmfasRoom.text,
                cmfasRoom.brassBgHover,
              )}
            >
              <span>Check the SCI exam schedule</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://tinyurl.com/CMFASregistration2025"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center justify-between gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors',
                cmfasRoom.brassBorder,
                cmfasRoom.brassBgSoft,
                cmfasRoom.brassText,
              )}
            >
              <span>Register for an exam</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── The one daily habit — spam iRecruit ───────────────────────────
       *  iRecruit is where the learner actually spends their hours. Pulled
       *  out into its own full-width card so the "spam the questions" message
       *  is the loudest thing on the page after the three rules.
       */}
      <section>
        <div className="flex items-center gap-2">
          <Repeat className={cn('h-4 w-4', cmfasRoom.brassText)} />
          <h2 className={cn('text-base font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
            Spam iRecruit. Every single day.
          </h2>
        </div>
        <p className={cn('mt-1 max-w-2xl text-xs', cmfasRoom.textMuted)}>
          This is the whole job. Drill 100–200 questions a day in Learning Mode. Clear the bank and you clear the paper.
        </p>
        <a
          href="https://joinus.aia.com.sg/app/login"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group mt-3 block rounded-2xl border-2 p-5 transition-colors',
            cmfasRoom.brassBorder,
            cmfasRoom.surfaceHover,
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
              <ScrollText className={cn('h-6 w-6', cmfasRoom.brassText)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={cn('text-base font-semibold', cmfasRoom.text)}>iRecruit question bank</h3>
                <ExternalLink className={cn('h-3 w-3', cmfasRoom.textFaint)} />
              </div>
              <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
                The canonical CMFAS practice bank. This is where the real studying happens, not in the textbook.
              </p>
              <p className={cn('mt-2 text-[11px]', cmfasRoom.textFaint)}>
                Path: iLearn → Pre-Contract → Pre-Contract (Online) → CMFAS M9 → Practice Questions → Launch
              </p>
            </div>
          </div>
        </a>
      </section>

      {/* ─── Your pocket coach — spar with AI, don't read at it ─────────────
       *  Reframes the AI tools as a sparring partner. Every wrong question
       *  goes to an AI to be explained and re-drilled, instead of the learner
       *  passively re-reading the chapter.
       */}
      <section>
        <div className="flex items-center gap-2">
          <GraduationCap className={cn('h-4 w-4', cmfasRoom.brassText)} />
          <h2 className={cn('text-base font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
            Your pocket coach
          </h2>
        </div>
        <p className={cn('mt-1 max-w-2xl text-xs', cmfasRoom.textMuted)}>
          Don't read blindly. Every question you get wrong, paste it into an AI and make it work for you:
          explain why the right answer is right, then quiz you back until it sticks. Treat it like a sparring
          partner in your pocket, on call at 2am the night before the paper.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          <a
            href="https://t.me/cmfas_bot"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group rounded-2xl border p-5 transition-colors',
              cmfasRoom.surface,
              cmfasRoom.surfaceHover,
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
                <MessageCircle className={cn('h-5 w-5', cmfasRoom.brassText)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn('text-sm font-semibold', cmfasRoom.text)}>@cmfas_bot</h3>
                  <ExternalLink className={cn('h-3 w-3', cmfasRoom.textFaint)} />
                </div>
                <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
                  Trained on the CMFAS syllabus. Ask about concepts, past questions, anything you're stuck on.
                </p>
              </div>
            </div>
          </a>

          <a
            href="https://notebooklm.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group rounded-2xl border p-5 transition-colors',
              cmfasRoom.surface,
              cmfasRoom.surfaceHover,
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
                <BookOpen className={cn('h-5 w-5', cmfasRoom.brassText)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn('text-sm font-semibold', cmfasRoom.text)}>NotebookLM</h3>
                  <ExternalLink className={cn('h-3 w-3', cmfasRoom.textFaint)} />
                </div>
                <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
                  Drop in the key-concept PDFs and ask questions grounded in your own notes. It cites the source, so you can trust the answer.
                </p>
              </div>
            </div>
          </a>

          <a
            href="https://chatgpt.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group rounded-2xl border p-5 transition-colors',
              cmfasRoom.surface,
              cmfasRoom.surfaceHover,
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
                <Bot className={cn('h-5 w-5', cmfasRoom.brassText)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn('text-sm font-semibold', cmfasRoom.text)}>ChatGPT</h3>
                  <ExternalLink className={cn('h-3 w-3', cmfasRoom.textFaint)} />
                </div>
                <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
                  Paste a question you got wrong and tell it to coach you: explain the logic, then keep quizzing you on the topic until it clicks.
                </p>
              </div>
            </div>
          </a>
        </div>
      </section>

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
                {r.to && <ChevronRight className={cn('h-3.5 w-3.5 shrink-0', cmfasRoom.textFaint)} />}
              </div>
            );
            const cardClasses = cn(
              'rounded-xl border p-4 transition-colors',
              cmfasRoom.surface,
              cmfasRoom.surfaceHover,
            );
            if (r.href) {
              return (
                <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer" className={cardClasses}>
                  {inner}
                </a>
              );
            }
            if (r.to) {
              return (
                <Link key={r.label} to={r.to} className={cardClasses}>
                  {inner}
                </Link>
              );
            }
            return (
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

      {/* ─── Ready to book? ────────────────────────────────────────────── */}
      <section className={cn('rounded-2xl border p-5', cmfasRoom.surface)}>
        <h2 className={cn('text-sm font-semibold uppercase tracking-[0.15em]', cmfasRoom.text)}>
          Ready to book? Check these first.
        </h2>
        <ul className={cn('mt-3 space-y-1.5 text-sm leading-relaxed', cmfasRoom.text)}>
          <li className="flex items-start gap-2">
            <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', cmfasRoom.brassText)} />
            <span>Cleared the full iLearn bank for the paper (~1,000 questions).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', cmfasRoom.brassText)} />
            <span>Scoring consistently above the pass mark on Premium Papers under timed conditions.</span>
          </li>
        </ul>
        <p className={cn('mt-3 text-xs', cmfasRoom.textMuted)}>
          Don't wait for a perfect score, and don't wait on the SCI mock papers either. Book once those two land,
          then save the mock papers for the final week before the date. Fear of booking is what stretches a 4-week paper into 8.
        </p>
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
