import { useEffect, useRef } from 'react';
import { BookOpen, Brain, CheckCircle2, Lightbulb, ListChecks, Lock, PlayCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cmfasRoom } from './cmfasTheme';

/** URL-bound workspace modes. Each one is a tab and a path segment under
 *  `/cmfas-exams/` (the default lives at the bare path). `today` is the
 *  Get-ready slide flow, which also owns `/cmfas-exams/today/:slideSlug`. */
export type WorkspaceMode = 'today' | 'lecture-videos' | 'practice' | 'study-tips' | 'syllabus';

interface NavItemSpec {
  id: WorkspaceMode;
  label: string;
  icon: LucideIcon;
  /** Greyed with a lock until Get ready is complete; a click explains why. */
  locked: boolean;
  /** Get-ready progress, shown as "3/5" until complete, then a check. */
  progress?: { done: number; total: number };
}

export interface CMFASWorkspaceNavItems {
  items: NavItemSpec[];
}

/**
 * Flat tab list. Order flips after onboarding.
 *
 * **Setup phase** (Get ready not complete): Get ready and Syllabus lead,
 * because finishing onboarding is the learner's job right now.
 *
 * **Post-onboarding**: the daily-use tabs (Study tips, Question bank,
 * Lecture videos) move to the front and the setup tabs drop to the end.
 *
 * Question bank and Lecture videos stay locked until Get ready is complete.
 */
export function buildNavSpec({
  readyProgress,
  readyComplete,
}: {
  readyProgress: { done: number; total: number };
  readyComplete: boolean;
}): CMFASWorkspaceNavItems {
  const today: NavItemSpec = { id: 'today', label: 'Get ready', icon: ListChecks, locked: false, progress: readyProgress };
  const syllabus: NavItemSpec = { id: 'syllabus', label: 'Syllabus & format', icon: BookOpen, locked: false };
  const studyTips: NavItemSpec = { id: 'study-tips', label: 'Study tips', icon: Lightbulb, locked: false };
  const practice: NavItemSpec = { id: 'practice', label: 'Question bank', icon: Brain, locked: !readyComplete };
  const videos: NavItemSpec = { id: 'lecture-videos', label: 'Lecture videos', icon: PlayCircle, locked: !readyComplete };

  if (!readyComplete) {
    return { items: [today, syllabus, studyTips, practice, videos] };
  }
  return { items: [studyTips, practice, videos, syllabus, today] };
}

export interface CMFASWorkspaceTabsProps {
  groups: CMFASWorkspaceNavItems;
  activeMode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  onLockedClick?: (mode: WorkspaceMode) => void;
}

/** Underline tabs that sit on the workspace header's bottom border. Scrolls
 *  sideways on narrow screens and keeps the active tab in view. */
export function CMFASWorkspaceTabs({ groups, activeMode, onModeChange, onLockedClick }: CMFASWorkspaceTabsProps) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active) return;
    const { offsetLeft, offsetWidth } = active;
    if (offsetLeft < nav.scrollLeft || offsetLeft + offsetWidth > nav.scrollLeft + nav.clientWidth) {
      nav.scrollLeft = offsetLeft - 16;
    }
  }, [activeMode]);

  return (
    <nav
      ref={navRef}
      aria-label="Exam prep sections"
      className="relative -mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {groups.items.map((item) => {
        const Icon = item.locked ? Lock : item.icon;
        const isActive = activeMode === item.id;
        const complete = item.progress != null && item.progress.done >= item.progress.total;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.locked ? onLockedClick?.(item.id) : onModeChange(item.id))}
            aria-current={isActive ? 'page' : undefined}
            aria-disabled={item.locked || undefined}
            title={item.locked ? 'Finish Get ready to unlock' : undefined}
            className={cn(
              'flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
              isActive
                ? 'border-primary font-semibold text-primary'
                : item.locked
                  ? cn('cursor-not-allowed border-transparent', cmfasRoom.dimmedText)
                  : cn('border-transparent font-medium hover:border-border hover:text-foreground', cmfasRoom.textMuted),
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
            {item.progress &&
              (complete ? (
                <CheckCircle2 className={cn('h-4 w-4 shrink-0', cmfasRoom.positiveText)} aria-label="complete" />
              ) : (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                    cmfasRoom.brassBgSoft,
                    cmfasRoom.brassText,
                  )}
                >
                  {item.progress.done}/{item.progress.total}
                </span>
              ))}
          </button>
        );
      })}
    </nav>
  );
}
