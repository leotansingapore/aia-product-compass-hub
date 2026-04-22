import { createPortal } from 'react-dom';
import { BookOpen, Brain, FileText, Home, Lock, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cmfasRoom } from './cmfasTheme';

export type WorkspaceMode = 'today' | 'papers' | 'practice' | 'rewards' | 'syllabus';

interface NavItemSpec {
  id: WorkspaceMode;
  label: string;
  icon: typeof Home;
  /** When true, the item is locked + greyed until Ready is complete. */
  locked: boolean;
  /** Optional badge — e.g. "3/6" on Ready, or a red dot on Today when resumed. */
  badge?: string;
}

export interface ResourceNavItemSpec {
  id: 'papers' | 'syllabus';
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  locked: boolean;
}

export interface CMFASWorkspaceNavGroups {
  primary: NavItemSpec[];
  resources: ResourceNavItemSpec[];
}

/** Primary study path + separate “additional resource” triggers (transparent in the UI). */
export function buildNavSpec({
  readyProgress,
  readyComplete,
}: {
  readyProgress: { done: number; total: number };
  readyComplete: boolean;
}): CMFASWorkspaceNavGroups {
  return {
    primary: [
      {
        id: 'today',
        label: 'Study desk',
        icon: Home,
        locked: false,
        badge: readyComplete ? '✓' : `${readyProgress.done}/${readyProgress.total}`,
      },
      { id: 'practice', label: 'Practice', icon: Brain, locked: !readyComplete },
      { id: 'rewards', label: 'Rewards', icon: Trophy, locked: false },
    ],
    resources: [
      {
        id: 'papers',
        label: 'Exam tutorials',
        shortLabel: 'Tutorials',
        icon: BookOpen,
        locked: !readyComplete,
      },
      {
        id: 'syllabus',
        label: 'Syllabus & format',
        shortLabel: 'Syllabus',
        icon: FileText,
        locked: false,
      },
    ],
  };
}

const resourceTriggerClassMobile = (isActive: boolean, locked: boolean) =>
  cn(
    'flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-center transition-colors',
    'min-h-[40px] border-[#b8894f]/20 bg-transparent',
    'text-[10px] font-medium text-[#c9b896] sm:text-[11px]',
    'hover:border-[#b8894f]/35 hover:bg-[#b8894f]/5 hover:text-[#e8d4b8]',
    isActive && 'border-[#b8894f]/50 bg-[#b8894f]/8 text-[#d4a574]',
    locked && 'cursor-not-allowed opacity-40',
  );

/** Top header — branding only; workspace modes live in {@link CMFASWorkspaceFloatingNav}. */
export interface CMFASWorkspaceTopBarProps {
  /**
   * When `brandingTitle` is set, replaces the default “CMFAS / Exam preparation room”
   * (e.g. Study desk title).
   */
  brandingEyebrow?: string;
  brandingTitle?: string;
}

export interface CMFASWorkspaceFloatingNavProps {
  groups: CMFASWorkspaceNavGroups;
  activeMode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  onLockedClick?: (mode: WorkspaceMode) => void;
}

/** Desktop (lg+): title strip only — mode nav is {@link CMFASWorkspaceFloatingNav}. */
export function CMFASWorkspaceTopBar({ brandingEyebrow, brandingTitle }: CMFASWorkspaceTopBarProps) {
  const eye = brandingTitle != null ? (brandingEyebrow ?? 'CMFAS') : 'CMFAS';
  const line = brandingTitle ?? 'Exam preparation room';

  return (
    <header
      className={cn(
        'relative z-20 hidden w-full shrink-0 border-b px-3 py-2.5',
        'bg-[#0a1424]/90 backdrop-blur-sm',
        cmfasRoom.brassBorderSoft,
        'lg:block',
        'xl:px-5 xl:py-3',
      )}
    >
      <div
        className={cn(
          'shrink-0 min-w-0',
          brandingTitle != null ? 'max-w-[min(100%,20rem)] xl:max-w-md' : 'xl:max-w-[11rem]',
        )}
      >
        <p className={cn('text-[10px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>{eye}</p>
        <p
          className={cn(
            brandingTitle != null
              ? 'mt-0.5 font-serif text-base font-bold leading-tight sm:text-lg'
              : 'truncate text-sm font-semibold',
            cmfasRoom.text,
          )}
        >
          {line}
        </p>
      </div>
    </header>
  );
}

const navTransitionFast = 'duration-100 ease-out';

const primaryBtnClass = (isActive: boolean, locked: boolean) =>
  cn(
    'flex h-10 w-full min-w-0 items-center justify-center gap-0 overflow-hidden rounded-xl p-0 text-left text-xs font-medium',
    navTransitionFast,
    'transition-[background-color,color,box-shadow]',
    'group-hover/nav:justify-start group-focus-within/nav:justify-start',
    isActive
      ? cn(cmfasRoom.brassBgSoft, cmfasRoom.brassText, 'font-semibold shadow-sm')
      : locked
        ? cn(cmfasRoom.dimmedText, 'cursor-not-allowed')
        : cn(cmfasRoom.textMuted, 'hover:bg-[#b8894f]/10 hover:text-[#d4a574]'),
  );

/** 40×40 hit area; Lucide SVGs often sit off-center in flex — pin with translate for true center. */
const iconCellClass = 'relative block h-10 w-10 shrink-0 overflow-visible';
const iconCenteredLg = 'absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2';
const iconCenteredMd = 'absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2';

const labelRevealClass = cn(
  'min-w-0 max-w-0 shrink self-center overflow-hidden whitespace-nowrap text-left leading-none opacity-0 transition-[max-width,opacity] ease-out pl-0',
  navTransitionFast,
  'group-hover/nav:pl-1 group-hover/nav:max-w-[9rem] group-hover/nav:opacity-100 group-focus-within/nav:pl-1 group-focus-within/nav:max-w-[9rem] group-focus-within/nav:opacity-100 sm:group-hover/nav:max-w-[12rem] sm:group-focus-within/nav:max-w-[12rem]',
);

const badgeRevealClass = cn(
  'mr-0 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tabular-nums',
  'max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] ease-out',
  navTransitionFast,
  'group-hover/nav:max-w-[3.5rem] group-hover/nav:opacity-100 group-focus-within/nav:max-w-[3.5rem] group-focus-within/nav:opacity-100',
);

/** Desktop (lg+): vertical floating rail; icons only, labels on hover or keyboard focus within the rail.
 *  Portaled to `document.body` so `position: fixed` is viewport-stable — `main.page-transition` uses
 *  transform for the fade-in animation, which would otherwise make fixed descendants track the scroller. */
export function CMFASWorkspaceFloatingNav({
  groups,
  activeMode,
  onModeChange,
  onLockedClick,
}: CMFASWorkspaceFloatingNavProps) {
  const nav = (
    <nav
      className={cn(
        'group/nav pointer-events-auto fixed left-3 top-28 z-40 hidden w-14 max-h-[min(calc(100vh-7.5rem),44rem)] flex-col gap-0.5 overflow-y-auto overflow-x-hidden rounded-2xl border p-1.5',
        'border-[#b8894f]/20 bg-[#0a1424]/30 backdrop-blur-md',
        'shadow-[0_8px_40px_rgba(0,0,0,0.18)]',
        'transition-[width,background-color,box-shadow] duration-100 ease-out',
        'hover:w-56 hover:bg-[#0a1424]/45 hover:shadow-[0_12px_48px_rgba(0,0,0,0.22)]',
        'focus-within:w-56 focus-within:bg-[#0a1424]/45 focus-within:shadow-[0_12px_48px_rgba(0,0,0,0.22)]',
        'lg:flex',
      )}
      aria-label="Workspace"
    >
      {groups.primary.map((item) => {
        const Icon = item.locked ? Lock : item.icon;
        const isActive = activeMode === item.id;
        const handleClick = () => {
          if (item.locked) {
            onLockedClick?.(item.id);
            return;
          }
          onModeChange(item.id);
        };
        return (
          <button
            key={item.id}
            type="button"
            onClick={handleClick}
            aria-current={isActive ? 'page' : undefined}
            className={primaryBtnClass(isActive, item.locked)}
            title={item.locked ? 'Locked' : item.label + (item.badge ? ` (${item.badge})` : '')}
          >
            <span className={iconCellClass}>
              <Icon className={iconCenteredLg} aria-hidden />
            </span>
            <span className={cn(labelRevealClass, item.locked && 'pointer-events-none', cmfasRoom.text)}>{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  badgeRevealClass,
                  item.badge === '✓'
                    ? cn(cmfasRoom.positiveBgSoft, cmfasRoom.positiveText)
                    : cn(cmfasRoom.brassBgSoft, cmfasRoom.brassText),
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      <div className="my-1.5 h-px w-full shrink-0 bg-[#b8894f]/20" role="separator" aria-hidden />

      {groups.resources.map((item) => {
        const Icon = item.locked ? Lock : item.icon;
        const isActive = activeMode === item.id;
        const handleClick = () => {
          if (item.locked) {
            onLockedClick?.(item.id);
            return;
          }
          onModeChange(item.id);
        };
        return (
          <button
            key={item.id}
            type="button"
            onClick={handleClick}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex h-10 w-full min-w-0 items-center justify-center gap-0 overflow-hidden rounded-lg border border-transparent p-0 text-left text-xs',
              navTransitionFast,
              'transition-[background-color,border-color,color,box-shadow]',
              'group-hover/nav:justify-start group-focus-within/nav:justify-start',
              'text-[#c9b896] hover:border-[#b8894f]/35 hover:bg-[#b8894f]/5',
              isActive && 'border-[#b8894f]/45 bg-[#b8894f]/8 text-[#d4a574]',
              item.locked && 'cursor-not-allowed opacity-40',
            )}
            title={item.locked ? 'Locked' : item.label}
          >
            <span className={iconCellClass}>
              <Icon className={iconCenteredMd} aria-hidden />
            </span>
            <span className={cn(labelRevealClass, item.locked && 'pointer-events-none')}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return createPortal(nav, document.body);
}

interface CMFASWorkspaceBottomNavProps {
  groups: CMFASWorkspaceNavGroups;
  activeMode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  onLockedClick?: (mode: WorkspaceMode) => void;
}

/** Mobile bottom (below lg). Primary row + a second row of transparent resource triggers. */
export function CMFASWorkspaceBottomNav({
  groups,
  activeMode,
  onModeChange,
  onLockedClick,
}: CMFASWorkspaceBottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed left-0 right-0 z-40 border-t backdrop-blur lg:hidden',
        cmfasRoom.canvasSoft,
        cmfasRoom.brassBorderSoft,
        'bottom-[calc(3.5rem+env(safe-area-inset-bottom))]',
      )}
      aria-label="CMFAS workspace"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <div className="flex min-h-[52px] items-stretch justify-around overflow-x-auto">
          {groups.primary.map((item) => {
            const Icon = item.locked ? Lock : item.icon;
            const isActive = activeMode === item.id;
            const handleClick = () => {
              if (item.locked) {
                onLockedClick?.(item.id);
                return;
              }
              onModeChange(item.id);
            };
            return (
              <button
                key={item.id}
                type="button"
                onClick={handleClick}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 transition-colors',
                  isActive
                    ? cmfasRoom.brassText
                    : item.locked
                      ? cmfasRoom.dimmedText
                      : cmfasRoom.textMuted,
                )}
              >
                {isActive && (
                  <span
                    className={cn('absolute top-0 h-0.5 w-8 rounded-b-full', cmfasRoom.brassBg)}
                    aria-hidden
                  />
                )}
                <Icon className="h-4 w-4" />
                <span className="px-0.5 text-center text-[10px] font-medium leading-tight">{item.label}</span>
                {item.badge && item.badge !== '✓' && (
                  <span
                    className={cn(
                      'absolute right-1 top-0.5 rounded-full px-1 text-[8px] font-bold',
                      cmfasRoom.brassBg,
                      'text-[#0a1424]',
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div
          className={cn('flex gap-2 border-t border-[#b8894f]/15 px-2 py-1.5', 'pb-[max(0.5rem,env(safe-area-inset-bottom))]')}
          role="group"
          aria-label="Additional resources"
        >
          {groups.resources.map((item) => {
            const Icon = item.locked ? Lock : item.icon;
            const isActive = activeMode === item.id;
            const handleClick = () => {
              if (item.locked) {
                onLockedClick?.(item.id);
                return;
              }
              onModeChange(item.id);
            };
            return (
              <button
                key={item.id}
                type="button"
                onClick={handleClick}
                aria-current={isActive ? 'page' : undefined}
                className={resourceTriggerClassMobile(isActive, item.locked)}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-2 leading-tight">
                  <span className="max-[360px]:hidden">{item.label}</span>
                  <span className="min-[361px]:hidden">{item.shortLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
