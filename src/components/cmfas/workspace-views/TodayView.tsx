import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarClock, Flame, Pause, Play, Target, Timer } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTargetExamDate } from '@/hooks/useTargetExamDate';
import { useCMFASMinutesToday } from '@/hooks/useCMFASMinutesToday';
import {
  formatPomodoroTime,
  pomodoroPhaseLabel,
  useCMFASStudy,
} from '../CMFASStudyProvider';
import {
  getCMFASModuleName,
  getCMFASModuleVideos,
  moduleIdToProductId,
} from '@/data/cmfasModuleData';
import { getVideoSlug } from '@/utils/slugUtils';
import { cmfasRoom } from '../cmfasTheme';

interface ResumeTarget {
  moduleId: string;
  moduleName: string;
  videoTitle: string;
  percentage: number;
}

const FOCUS_MS = 25 * 60 * 1000;
const SHORT_BREAK_MS = 5 * 60 * 1000;
const LONG_BREAK_MS = 15 * 60 * 1000;

/**
 * Today hero when setup is complete. One primary ring (pomodoro), the next
 * lesson to resume, the exam countdown, and a quiet stat strip. The learner
 * should need at most one click to start studying.
 */
export function TodayView({ onOpenCountdown }: { onOpenCountdown: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { phase, isPaused, isRunning, remainingMs, start, pause, sessionsToday } = useCMFASStudy();
  const { minutes } = useCMFASMinutesToday();
  const { isoDate, date, daysUntil } = useTargetExamDate();
  const [resume, setResume] = useState<ResumeTarget | null>(null);
  const [streak, setStreak] = useState(0);

  // Streak from profile
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('streak_days')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled) setStreak((data as { streak_days?: number } | null)?.streak_days ?? 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Resume target — most recently updated incomplete CMFAS video
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const productIds = Object.values(moduleIdToProductId);
      const { data, error } = await supabase
        .from('video_progress')
        .select('product_id, video_id, completion_percentage, updated_at')
        .eq('user_id', user.id)
        .in('product_id', productIds)
        .eq('completed', false)
        .order('updated_at', { ascending: false })
        .limit(1);
      if (cancelled || error || !data || data.length === 0) return;
      const row = data[0] as { product_id: string; video_id: string; completion_percentage: number };
      const entry = Object.entries(moduleIdToProductId).find(([, pid]) => pid === row.product_id);
      if (!entry) return;
      const [moduleId] = entry;
      const lesson = getCMFASModuleVideos(moduleId).find((v) => v.id === row.video_id);
      if (!lesson) return;
      setResume({
        moduleId,
        moduleName: getCMFASModuleName(moduleId),
        videoTitle: lesson.title,
        percentage: row.completion_percentage ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

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
  const circumference = 2 * Math.PI * 64;
  const offset = circumference * (1 - fraction);

  const handleStart = () => {
    if (phase === 'idle') {
      start();
      if (resume) {
        const slug = getVideoSlug(resume.videoTitle);
        navigate(`/cmfas/module/${resume.moduleId}/video/${slug}`);
      }
    } else if (isPaused) {
      start();
    }
  };

  const handleOpen = () => {
    if (!resume) return;
    const slug = getVideoSlug(resume.videoTitle);
    navigate(`/cmfas/module/${resume.moduleId}/video/${slug}`);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
          Today
        </p>
        <h1 className={cn('mt-2 font-serif text-3xl font-bold sm:text-4xl', cmfasRoom.text)}>
          Sit down. Study.
        </h1>
      </header>

      {/* The study desk — big pomodoro ring + resume card */}
      <div
        className={cn(
          'grid grid-cols-1 gap-6 overflow-hidden rounded-2xl border p-6 md:grid-cols-[auto_1fr] md:gap-8 md:p-8',
          cmfasRoom.surfaceStrong,
        )}
      >
        {/* Pomodoro ring */}
        <div className="flex items-center justify-center md:justify-start">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 144 144" aria-hidden>
              <circle cx="72" cy="72" r="64" fill="none" strokeWidth="6" className="stroke-muted-foreground/20" />
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cn(
                  'transition-[stroke-dashoffset] duration-1000 ease-linear',
                  phase === 'focus' ? 'stroke-primary' : 'stroke-emerald-400',
                )}
              />
            </svg>
            <div className="relative text-center">
              <p className={cn('font-mono text-3xl font-bold tabular-nums', cmfasRoom.text)}>
                {phase === 'idle' ? '25:00' : formatPomodoroTime(remainingMs)}
              </p>
              <p className={cn('mt-0.5 text-[10px] font-semibold uppercase tracking-wider', cmfasRoom.textFaint)}>
                {pomodoroPhaseLabel(phase, isPaused)}
              </p>
            </div>
          </div>
        </div>

        {/* Resume + CTA */}
        <div className="flex min-w-0 flex-col justify-center gap-4">
          <div>
            <p className={cn('text-[10px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
              {resume ? 'Continue where you left off' : "You're ready to begin"}
            </p>
            <h2 className={cn('mt-1 truncate text-xl font-bold leading-snug sm:text-2xl', cmfasRoom.text)}>
              {resume ? resume.moduleName : 'Pick a paper and start'}
            </h2>
            {resume && (
              <p className={cn('mt-1 text-sm', cmfasRoom.textMuted)}>
                {resume.videoTitle}
              </p>
            )}
            {resume && resume.percentage > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <Progress value={resume.percentage} className="h-1.5 flex-1" />
                <span className={cn('shrink-0 text-xs tabular-nums', cmfasRoom.textMuted)}>
                  {Math.round(resume.percentage)}%
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {phase === 'idle' ? (
              <Button
                size="lg"
                onClick={handleStart}
                className={cn('gap-2 text-sm font-semibold', 'bg-primary text-primary-foreground hover:bg-primary')}
              >
                <Play className="h-4 w-4" />
                Start 25-min session
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={isRunning ? pause : start}
                  variant="outline"
                  className={cn('gap-2', cmfasRoom.brassBorder, cmfasRoom.text)}
                >
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isRunning ? 'Pause' : 'Resume'}
                </Button>
                {resume && (
                  <Button size="lg" onClick={handleOpen} className={cn('gap-2', 'bg-primary text-primary-foreground hover:bg-primary')}>
                    <BookOpen className="h-4 w-4" />
                    Open lesson
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Secondary strip: countdown + stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <CountdownStat onOpen={onOpenCountdown} daysUntil={daysUntil} date={date} isoDate={isoDate} />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Streak" value={streak > 0 ? `${streak} d` : '—'} />
        <StatCard icon={<Timer className="h-4 w-4" />} label="Minutes today" value={minutes > 0 ? `${minutes} min` : '—'} />
        <StatCard icon={<Target className="h-4 w-4" />} label="Pomodoros" value={sessionsToday > 0 ? `${sessionsToday}` : '—'} />
      </div>
    </div>
  );
}

function CountdownStat({
  daysUntil,
  date,
  isoDate,
  onOpen,
}: {
  daysUntil: number | null;
  date: Date | null;
  isoDate: string | null;
  onOpen: () => void;
}) {
  if (!isoDate || daysUntil === null || !date) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
          cmfasRoom.surface,
          cmfasRoom.surfaceHover,
        )}
      >
        <CalendarClock className={cn('h-4 w-4 shrink-0', cmfasRoom.brassText)} />
        <div className="min-w-0">
          <p className={cn('text-[10px] font-semibold uppercase tracking-wider', cmfasRoom.textFaint)}>
            Target exam
          </p>
          <p className={cn('text-xs font-semibold', cmfasRoom.text)}>Set a date →</p>
        </div>
      </button>
    );
  }
  const label = daysUntil < 0 ? `${Math.abs(daysUntil)} d ago` : daysUntil === 0 ? 'Today' : `${daysUntil} d`;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
        cmfasRoom.surface,
        cmfasRoom.surfaceHover,
      )}
    >
      <CalendarClock className={cn('h-4 w-4 shrink-0', cmfasRoom.brassText)} />
      <div className="min-w-0">
        <p className={cn('text-[10px] font-semibold uppercase tracking-wider', cmfasRoom.textFaint)}>
          {daysUntil < 0 ? 'Target passed' : 'Until exam'}
        </p>
        <p className={cn('text-lg font-bold tabular-nums', cmfasRoom.text)}>{label}</p>
        <p className={cn('text-[10px]', cmfasRoom.textFaint)}>{format(date, 'd MMM')}</p>
      </div>
    </button>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className={cn('flex items-center gap-3 rounded-xl border px-4 py-3', cmfasRoom.surface)}>
      <span className={cn('shrink-0', cmfasRoom.brassText)}>{icon}</span>
      <div className="min-w-0">
        <p className={cn('text-[10px] font-semibold uppercase tracking-wider', cmfasRoom.textFaint)}>
          {label}
        </p>
        <p className={cn('text-lg font-bold tabular-nums', cmfasRoom.text)}>{value}</p>
      </div>
    </div>
  );
}
