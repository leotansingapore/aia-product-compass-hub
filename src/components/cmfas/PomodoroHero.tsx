import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatPomodoroTime,
  pomodoroPhaseLabel,
  useCMFASStudy,
} from './CMFASStudyProvider';
import { cmfasTone } from './cmfasTheme';

const FOCUS_MS = 25 * 60 * 1000;
const SHORT_BREAK_MS = 5 * 60 * 1000;
const LONG_BREAK_MS = 15 * 60 * 1000;

/**
 * Big circular pomodoro timer meant for the hub's Today card. The ring shows
 * remaining time as a fraction of the current phase; inside the ring, the
 * mm:ss display. Controls beneath.
 */
export function PomodoroHero({ label }: { label?: string }) {
  const { phase, isPaused, isRunning, remainingMs, start, pause, reset, skip } =
    useCMFASStudy();

  const totalMs =
    phase === 'focus'
      ? FOCUS_MS
      : phase === 'short-break'
        ? SHORT_BREAK_MS
        : phase === 'long-break'
          ? LONG_BREAK_MS
          : FOCUS_MS;
  const fraction =
    phase === 'idle' ? 0 : Math.max(0, Math.min(1, 1 - remainingMs / totalMs));
  const circumference = 2 * Math.PI * 46; // r=46
  const offset = circumference * (1 - fraction);

  const phaseColor =
    phase === 'focus'
      ? 'stroke-cyan-500'
      : phase === 'short-break' || phase === 'long-break'
        ? 'stroke-emerald-500'
        : 'stroke-cyan-500';

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <p className={cn('text-[11px] font-semibold uppercase tracking-wider', cmfasTone.accentText)}>
          {label}
        </p>
      )}
      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="4"
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-[stroke-dashoffset] duration-1000 ease-linear', phaseColor)}
          />
        </svg>
        <div className="relative flex flex-col items-center">
          <span className="font-mono text-3xl font-bold tabular-nums text-foreground">
            {phase === 'idle' ? '25:00' : formatPomodoroTime(remainingMs)}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {pomodoroPhaseLabel(phase, isPaused)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {phase === 'idle' ? (
          <Button
            size="sm"
            className={cn('gap-1.5', 'bg-cyan-600 hover:bg-cyan-700 text-white')}
            onClick={start}
          >
            <Play className="h-4 w-4" />
            Start 25-min session
          </Button>
        ) : (
          <>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={isRunning ? pause : start}>
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5" onClick={skip}>
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              End
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
