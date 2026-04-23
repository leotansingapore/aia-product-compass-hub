import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { cmfasRoom } from '../cmfasTheme';
import { READY_STEP_IDS } from './getReadyData';

/**
 * Maps the Skool CMFAS classroom 1:1 into an Academy outline. Every row is a
 * clickable destination. Completion ticks share IDs with CMFASOnboardingWizard
 * for items that live inside the wizard, so hub and wizard stay in sync.
 */

interface OutlineLesson {
  number: string;        // e.g. "1", "2.1", "3.4"
  id: string;            // useChecklistProgress key
  title: string;
  hint?: string;
  href: string;          // internal route or external url
  external?: boolean;    // open in new tab
  locked?: (readyComplete: boolean) => boolean;
}

interface OutlineSection {
  number: number;
  title: string;
  tagline?: string;
  lessons: OutlineLesson[];
}

const WIZARD_BASE = "/cmfas/module/onboarding";
/** Deep-link into onboarding wizard: Course content tab + correct step. */
const wizardStep = (stepId: string) => `${WIZARD_BASE}?step=${encodeURIComponent(stepId)}`;

const OUTLINE: OutlineSection[] = [
  {
    number: 1,
    title: 'Rules of the Game',
    tagline: 'How the program works and what "passing" means.',
    lessons: [
      {
        number: '1',
        id: 'welcome',
        title: 'Rules of the Game',
        hint: 'The philosophy · 5 min read',
        href: wizardStep("welcome"),
      },
    ],
  },
  {
    number: 2,
    title: 'How to Register & Book the Exams',
    tagline: 'Get into the system before you study. Deadlines keep you honest.',
    lessons: [
      {
        number: '2.1',
        id: 'create-student-account',
        title: 'Creating a student account',
        hint: 'SCI College registration',
        href: wizardStep("create-student-account"),
      },
      {
        number: '2.2',
        id: 'register-m9-exam',
        title: 'Register for the M9 Exam',
        hint: 'Book early — a real date pulls you through the study',
        href: wizardStep("register-m9-exam"),
      },
    ],
  },
  {
    number: 3,
    title: 'Exam Resources',
    tagline: 'The tooling. Learn by doing questions, not reading cover-to-cover.',
    lessons: [
      {
        number: '3.1',
        id: 'access-question-bank',
        title: 'Get Access to Exam Question Bank',
        hint: 'The #1 step people skip. Do it today.',
        href: wizardStep("access-question-bank"),
      },
      {
        number: '3.2',
        id: 'study-tips',
        title: 'Exam Study Tips & Resources to Save You Time',
        hint: 'Strategies + guidebooks',
        href: wizardStep("understand-costs-timeline"),
      },
      {
        number: '3.3',
        id: 'chatbot',
        title: 'Chatbot Access',
        hint: '24/7 AI tutor on Telegram (@cmfas_bot)',
        href: wizardStep("register-m9-exam"),
      },
      {
        number: '3.4',
        id: 'flashcards',
        title: 'Learn Faster Using Flashcards',
        hint: 'Revisely decks per paper',
        href: wizardStep("first-practice"),
      },
    ],
  },
  {
    number: 4,
    title: 'Rewards for Passing',
    tagline: 'Real cash for passing fast. Not points.',
    lessons: [
      {
        number: '4.1',
        id: 'rewards-challenges',
        title: 'Challenges & Rewards',
        hint: 'Quick-Pass · First-Time · Refer-A-Friend',
        href: '/cmfas-exams?mode=rewards',
      },
    ],
  },
  {
    number: 5,
    title: 'Exam Syllabus and Format',
    tagline: 'Know what each paper covers and how long you have.',
    lessons: [
      {
        number: '5.1',
        id: 'syllabus-overview',
        title: 'CMFAS Exam Guide',
        hint: 'Why the papers exist, MAS oversight, what you get',
        href: '/cmfas-exams?mode=syllabus',
      },
      {
        number: '5.2',
        id: 'syllabus-m9',
        title: 'M9 Exam — Life Insurance and ILPs',
        hint: '100 MCQ · 120 min · 70% pass',
        href: '/cmfas-exams?mode=syllabus',
      },
      {
        number: '5.3',
        id: 'syllabus-m9a',
        title: 'M9A Exam — Structured Products & Derivatives',
        hint: '50 MCQ · 60 min · 70% pass',
        href: '/cmfas-exams?mode=syllabus',
      },
      {
        number: '5.4',
        id: 'syllabus-hi',
        title: 'HI Exam — Health Insurance',
        hint: '50 MCQ · 75 min · 70% pass',
        href: '/cmfas-exams?mode=syllabus',
      },
      {
        number: '5.5',
        id: 'syllabus-res5',
        title: 'RES5 Exam — Rules, Ethics & Skills',
        hint: '150 MCQ · 180 min · Part I ≥75% AND Part II ≥80%',
        href: '/cmfas-exams?mode=syllabus',
      },
    ],
  },
  {
    number: 6,
    title: 'Exam Tutorial',
    tagline: 'Day-by-day lessons per paper.',
    lessons: [
      {
        number: '6.1',
        id: 'tutorial-m9',
        title: 'M9 — Life Insurance',
        hint: 'Day 1 Parts 1–3 · Day 2 Parts 1–2',
        href: '/cmfas/module/m9',
        locked: (ready) => !ready,
      },
      {
        number: '6.2',
        id: 'tutorial-m9a',
        title: 'M9A — Life Insurance II',
        hint: 'Day 1 · Day 2 Parts 1–2',
        href: '/cmfas/module/m9a',
        locked: (ready) => !ready,
      },
      {
        number: '6.3',
        id: 'tutorial-hi',
        title: 'HI — Health Insurance',
        href: '/cmfas/module/hi',
        locked: (ready) => !ready,
      },
      {
        number: '6.4',
        id: 'tutorial-res5',
        title: 'RES5 — Rules, Ethics & Skills',
        hint: 'Day 1 Parts 1–4 · Day 2 Parts 1–5',
        href: '/cmfas/module/res5',
        locked: (ready) => !ready,
      },
    ],
  },
];

export type CourseOutlineVariant = 'default' | 'embedded';

export function CourseOutlineView({ variant = 'default' }: { variant?: CourseOutlineVariant } = {}) {
  const navigate = useNavigate();
  const { isItemCompleted, completeItem } = useChecklistProgress();

  const readyDone = READY_STEP_IDS.filter((id) => isItemCompleted(id)).length;
  const readyComplete = readyDone >= READY_STEP_IDS.length;

  const handleOpen = (lesson: OutlineLesson) => {
    const isLocked = lesson.locked?.(readyComplete) ?? false;
    if (isLocked) return;
    if (lesson.external) {
      window.open(lesson.href, '_blank', 'noopener,noreferrer');
    } else if (lesson.href.startsWith('/')) {
      navigate(lesson.href);
    } else {
      window.open(lesson.href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // useChecklistProgress only supports complete — not toggle off. That's
    // fine for the MVP: learners tick on as they finish, rarely untick.
    if (!isItemCompleted(id)) completeItem(id);
  };

  // Progress roll-up across the whole outline.
  const allLessons = OUTLINE.flatMap((s) => s.lessons);
  const completed = allLessons.filter((l) => isItemCompleted(l.id)).length;
  const total = allLessons.length;

  return (
    <div className="space-y-8">
      <header>
        {variant === 'embedded' ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <p className={cn('max-w-2xl text-sm', cmfasRoom.textMuted)}>
              Work through the sections in order. Tutorials unlock once Get Ready is complete (
              {readyDone}/{READY_STEP_IDS.length} checklist items, or 100% onboarding videos).
            </p>
            <div
              className={cn(
                'inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-3 py-1 text-xs tabular-nums',
                cmfasRoom.brassBorder,
                cmfasRoom.brassBgSoft,
                cmfasRoom.brassText,
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {completed} of {total} items complete
            </div>
          </div>
        ) : (
          <>
            <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
              CMFAS Classroom
            </p>
            <h1 className={cn('mt-2 font-serif text-3xl font-bold sm:text-4xl', cmfasRoom.text)}>
              Your course outline.
            </h1>
            <p className={cn('mt-2 max-w-2xl text-sm', cmfasRoom.textMuted)}>
              Work through the sections in order. Check items off as you go — the Tutorials unlock
              once you've finished Get Ready ({readyDone}/{READY_STEP_IDS.length}).
            </p>
            <div
              className={cn(
                'mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tabular-nums',
                cmfasRoom.brassBorder,
                cmfasRoom.brassBgSoft,
                cmfasRoom.brassText,
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {completed} of {total} items complete
            </div>
          </>
        )}
      </header>

      <div className="space-y-6">
        {OUTLINE.map((section) => (
          <section
            key={section.number}
            className={cn('overflow-hidden rounded-2xl border', cmfasRoom.surface)}
          >
            <header className={cn('border-b px-5 py-4', cmfasRoom.brassBorderSoft)}>
              <div className="flex items-baseline gap-3">
                <span className={cn('font-serif text-2xl font-bold', cmfasRoom.brassText)}>
                  {section.number}
                </span>
                <h2 className={cn('text-lg font-bold', cmfasRoom.text)}>{section.title}</h2>
              </div>
              {section.tagline && (
                <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>{section.tagline}</p>
              )}
            </header>

            <ul className="divide-y divide-primary/10">
              {section.lessons.map((lesson) => {
                const completed = isItemCompleted(lesson.id);
                const locked = lesson.locked?.(readyComplete) ?? false;
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => handleOpen(lesson)}
                      disabled={locked}
                      aria-disabled={locked}
                      className={cn(
                        'group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors',
                        locked
                          ? 'cursor-not-allowed'
                          : cn(cmfasRoom.surfaceHover, 'cursor-pointer'),
                      )}
                    >
                      {/* Tick */}
                      <span
                        role="checkbox"
                        aria-checked={completed}
                        tabIndex={0}
                        onClick={(e) => !locked && handleToggle(lesson.id, e)}
                        onKeyDown={(e) => {
                          if (!locked && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isItemCompleted(lesson.id)) completeItem(lesson.id);
                          }
                        }}
                        className="shrink-0"
                      >
                        {locked ? (
                          <Lock className={cn('h-5 w-5', cmfasRoom.dimmedText)} />
                        ) : completed ? (
                          <CheckCircle2 className={cn('h-5 w-5', cmfasRoom.positiveText)} />
                        ) : (
                          <Circle className={cn('h-5 w-5 transition-colors', cmfasRoom.textFaint, 'group-hover:text-primary')} />
                        )}
                      </span>

                      {/* Number + title */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={cn(
                              'shrink-0 font-mono text-xs tabular-nums',
                              locked ? cmfasRoom.dimmedText : cmfasRoom.brassText,
                            )}
                          >
                            {lesson.number}
                          </span>
                          <p
                            className={cn(
                              'text-sm font-medium leading-snug',
                              locked
                                ? cmfasRoom.dimmedText
                                : completed
                                  ? cn(cmfasRoom.textFaint, 'line-through')
                                  : cmfasRoom.text,
                            )}
                          >
                            {lesson.title}
                          </p>
                        </div>
                        {lesson.hint && !completed && (
                          <p
                            className={cn(
                              'mt-0.5 text-xs',
                              locked ? cmfasRoom.dimmedText : cmfasRoom.textMuted,
                            )}
                          >
                            {locked ? 'Unlocks after Get Ready' : lesson.hint}
                          </p>
                        )}
                      </div>

                      {!locked && (
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                            cmfasRoom.textFaint,
                          )}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
