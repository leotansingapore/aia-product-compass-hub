import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { startOfDay } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

// Pomodoro defaults. 25/5/15, long break every 4 focus sessions.
const FOCUS_MS = 25 * 60 * 1000;
const SHORT_BREAK_MS = 5 * 60 * 1000;
const LONG_BREAK_MS = 15 * 60 * 1000;
const SESSIONS_UNTIL_LONG_BREAK = 4;
const TICK_MS = 1000;

type Phase = 'idle' | 'focus' | 'short-break' | 'long-break';

interface PersistedState {
  phase: Phase;
  endsAt: number | null;      // ms timestamp when the current phase ends
  sessionsToday: number;      // focus sessions completed today
  sessionsDayIso: string;     // "yyyy-mm-dd" the sessionsToday count belongs to
  focusSinceLongBreak: number; // streak of focus sessions since the last long break
}

interface CMFASStudyContextValue {
  phase: Phase;
  /** Remaining ms in the current phase. 0 when idle. */
  remainingMs: number;
  /** Active minutes currently elapsed in the CURRENT focus session (not persisted across reload). */
  sessionsToday: number;
  /** Start a new focus session. No-op if already running. */
  start: () => void;
  /** Pause the current session — remaining time preserved. */
  pause: () => void;
  /** Reset back to idle, zeroing the current phase. */
  reset: () => void;
  /** Skip to next phase (useful for testing or when learner needs a break sooner). */
  skip: () => void;
  /** True when a session is in any non-idle phase. */
  isRunning: boolean;
  /** True when paused (phase is non-idle but timer is not counting down). */
  isPaused: boolean;
}

const CMFASStudyContext = createContext<CMFASStudyContextValue | null>(null);

function todayIso() {
  const d = startOfDay(new Date());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nextDuration(nextPhase: Phase): number {
  switch (nextPhase) {
    case 'focus':
      return FOCUS_MS;
    case 'short-break':
      return SHORT_BREAK_MS;
    case 'long-break':
      return LONG_BREAK_MS;
    default:
      return 0;
  }
}

export function CMFASStudyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = useMemo(() => (user ? `cmfas-pomodoro-${user.id}` : null), [user]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [focusSinceLongBreak, setFocusSinceLongBreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate from localStorage.
  useEffect(() => {
    if (!storageKey) {
      setPhase('idle');
      setEndsAt(null);
      setRemainingMs(0);
      setSessionsToday(0);
      setFocusSinceLongBreak(0);
      setIsPaused(false);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedState> & { pausedRemainingMs?: number };
      // If the stored sessionsToday belongs to a previous day, reset the counter.
      const stateToday = todayIso();
      const sessionsCount = parsed.sessionsDayIso === stateToday ? parsed.sessionsToday ?? 0 : 0;
      setSessionsToday(sessionsCount);
      setFocusSinceLongBreak(parsed.focusSinceLongBreak ?? 0);

      if (parsed.phase && parsed.phase !== 'idle' && typeof parsed.endsAt === 'number') {
        const now = Date.now();
        if (parsed.endsAt > now) {
          setPhase(parsed.phase);
          setEndsAt(parsed.endsAt);
          setRemainingMs(parsed.endsAt - now);
          setIsPaused(false);
        } else if (typeof parsed.pausedRemainingMs === 'number' && parsed.pausedRemainingMs > 0) {
          // Session was paused before reload — keep the paused state.
          setPhase(parsed.phase);
          setEndsAt(null);
          setRemainingMs(parsed.pausedRemainingMs);
          setIsPaused(true);
        }
      }
    } catch (err) {
      console.warn('CMFASStudyProvider: hydrate failed', err);
    }
  }, [storageKey]);

  // Persist state on relevant changes.
  const persist = useCallback(
    (next: Partial<PersistedState> & { pausedRemainingMs?: number | null }) => {
      if (!storageKey) return;
      try {
        const existing = localStorage.getItem(storageKey);
        const base = existing ? (JSON.parse(existing) as PersistedState) : null;
        const merged = {
          phase: next.phase ?? base?.phase ?? 'idle',
          endsAt: next.endsAt !== undefined ? next.endsAt : base?.endsAt ?? null,
          sessionsToday: next.sessionsToday ?? base?.sessionsToday ?? 0,
          sessionsDayIso: next.sessionsDayIso ?? base?.sessionsDayIso ?? todayIso(),
          focusSinceLongBreak:
            next.focusSinceLongBreak ?? base?.focusSinceLongBreak ?? 0,
          pausedRemainingMs: next.pausedRemainingMs ?? undefined,
        };
        localStorage.setItem(storageKey, JSON.stringify(merged));
      } catch (err) {
        console.warn('CMFASStudyProvider: persist failed', err);
      }
    },
    [storageKey],
  );

  // Clear the ticking interval when phase becomes idle or paused.
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (phase === 'idle' || isPaused || !endsAt) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = endsAt - now;
      if (remaining <= 0) {
        // Phase ended — auto-advance.
        handlePhaseEnd();
      } else {
        setRemainingMs(remaining);
      }
    }, TICK_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isPaused, endsAt]);

  const handlePhaseEnd = useCallback(() => {
    // Determine next phase based on the phase that just finished.
    setPhase((currentPhase) => {
      if (currentPhase === 'focus') {
        const nextFocusStreak = focusSinceLongBreak + 1;
        const nextPhase: Phase =
          nextFocusStreak >= SESSIONS_UNTIL_LONG_BREAK ? 'long-break' : 'short-break';
        const duration = nextDuration(nextPhase);
        const newEndsAt = Date.now() + duration;
        const newSessions = sessionsToday + 1;
        const newStreak = nextPhase === 'long-break' ? 0 : nextFocusStreak;
        setSessionsToday(newSessions);
        setFocusSinceLongBreak(newStreak);
        setEndsAt(newEndsAt);
        setRemainingMs(duration);
        setIsPaused(false);
        persist({
          phase: nextPhase,
          endsAt: newEndsAt,
          sessionsToday: newSessions,
          sessionsDayIso: todayIso(),
          focusSinceLongBreak: newStreak,
          pausedRemainingMs: null,
        });
        return nextPhase;
      }
      // Break ended — jump back into focus.
      const duration = nextDuration('focus');
      const newEndsAt = Date.now() + duration;
      setEndsAt(newEndsAt);
      setRemainingMs(duration);
      setIsPaused(false);
      persist({
        phase: 'focus',
        endsAt: newEndsAt,
        pausedRemainingMs: null,
      });
      return 'focus';
    });
  }, [focusSinceLongBreak, sessionsToday, persist]);

  const start = useCallback(() => {
    // If already running, no-op. If paused, resume by extending endsAt by remaining.
    if (phase !== 'idle' && !isPaused) return;

    const durationToUse =
      isPaused && remainingMs > 0 ? remainingMs : nextDuration('focus');
    const nextPhase: Phase = phase === 'idle' ? 'focus' : phase;
    const newEndsAt = Date.now() + durationToUse;

    setPhase(nextPhase);
    setEndsAt(newEndsAt);
    setRemainingMs(durationToUse);
    setIsPaused(false);
    persist({
      phase: nextPhase,
      endsAt: newEndsAt,
      sessionsDayIso: todayIso(),
      pausedRemainingMs: null,
    });
  }, [phase, isPaused, remainingMs, persist]);

  const pause = useCallback(() => {
    if (phase === 'idle' || isPaused || !endsAt) return;
    const remaining = Math.max(0, endsAt - Date.now());
    setIsPaused(true);
    setRemainingMs(remaining);
    setEndsAt(null);
    persist({
      phase,
      endsAt: null,
      pausedRemainingMs: remaining,
    });
  }, [phase, isPaused, endsAt, persist]);

  const reset = useCallback(() => {
    setPhase('idle');
    setEndsAt(null);
    setRemainingMs(0);
    setIsPaused(false);
    persist({
      phase: 'idle',
      endsAt: null,
      pausedRemainingMs: null,
    });
  }, [persist]);

  const skip = useCallback(() => {
    if (phase === 'idle') return;
    handlePhaseEnd();
  }, [phase, handlePhaseEnd]);

  const value = useMemo<CMFASStudyContextValue>(
    () => ({
      phase,
      remainingMs,
      sessionsToday,
      start,
      pause,
      reset,
      skip,
      isRunning: phase !== 'idle' && !isPaused,
      isPaused,
    }),
    [phase, remainingMs, sessionsToday, start, pause, reset, skip, isPaused],
  );

  return <CMFASStudyContext.Provider value={value}>{children}</CMFASStudyContext.Provider>;
}

export function useCMFASStudy() {
  const ctx = useContext(CMFASStudyContext);
  if (!ctx) {
    throw new Error('useCMFASStudy must be used inside CMFASStudyProvider');
  }
  return ctx;
}

/**
 * Format milliseconds as mm:ss.
 */
export function formatPomodoroTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Phase-aware label for the UI.
 */
export function pomodoroPhaseLabel(phase: Phase, isPaused: boolean): string {
  if (phase === 'idle') return 'Ready to study';
  if (isPaused) return 'Paused';
  if (phase === 'focus') return 'Focus';
  if (phase === 'short-break') return 'Short break';
  return 'Long break';
}

export type { Phase };
