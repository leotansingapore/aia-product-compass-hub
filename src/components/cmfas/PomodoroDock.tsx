import { useLocation } from 'react-router-dom';
import { Pause, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatPomodoroTime,
  pomodoroPhaseLabel,
  useCMFASStudy,
} from './CMFASStudyProvider';
import { cmfasTone } from './cmfasTheme';

/**
 * Floating pomodoro chip pinned bottom-right while the learner is inside any
 * `/cmfas/*` route AND a session is non-idle. Hides itself everywhere else.
 * Sits above the fixed MobileBottomNav + safe-area on mobile.
 */
export function PomodoroDock() {
  const { pathname } = useLocation();
  const { phase, isPaused, remainingMs, start, pause, reset } = useCMFASStudy();

  // Only show on CMFAS routes.
  const onCMFASRoute = pathname === '/cmfas-exams' || pathname.startsWith('/cmfas/');
  if (!onCMFASRoute) return null;

  // Hide when idle — start button lives on the hub's PomodoroHero.
  if (phase === 'idle') return null;

  const isFocus = phase === 'focus';
  const label = pomodoroPhaseLabel(phase, isPaused);

  return (
    <div
      className={cn(
        'fixed left-auto right-4 z-[60]',
        // Above MobileBottomNav on mobile (~56px + safe area), inset on desktop
        'bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.75rem)] md:bottom-4',
      )}
      role="region"
      aria-label="CMFAS study timer"
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border-2 bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80',
          isFocus ? cmfasTone.accentBorder : cmfasTone.positiveBorder,
        )}
      >
        <div className={cn('flex items-center gap-1.5', cmfasTone.accentText)}>
          <span
            className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              isPaused
                ? 'bg-muted-foreground'
                : isFocus
                  ? 'bg-cyan-500 animate-pulse'
                  : 'bg-emerald-500 animate-pulse',
            )}
            aria-hidden
          />
          <span className="text-[10px] font-semibold uppercase tracking-wider">
            {label}
          </span>
        </div>
        <span className="font-mono text-sm font-bold tabular-nums text-foreground">
          {formatPomodoroTime(remainingMs)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={isPaused ? start : pause}
          aria-label={isPaused ? 'Resume session' : 'Pause session'}
        >
          {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          onClick={reset}
          aria-label="End session"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
