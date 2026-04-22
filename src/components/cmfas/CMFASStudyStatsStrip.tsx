import { useEffect, useState } from 'react';
import { Flame, Target, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCMFASStudy } from './CMFASStudyProvider';
import { useCMFASMinutesToday } from '@/hooks/useCMFASMinutesToday';
import { cmfasTone } from './cmfasTheme';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: 'accent' | 'positive' | 'neutral';
}

function StatCard({ icon, label, value, sub, tone = 'accent' }: StatCardProps) {
  const iconBg =
    tone === 'positive'
      ? cmfasTone.positiveBg
      : tone === 'neutral'
        ? 'bg-muted'
        : cmfasTone.accentBg;
  const iconText =
    tone === 'positive'
      ? cmfasTone.positiveText
      : tone === 'neutral'
        ? cmfasTone.neutralText
        : cmfasTone.accentText;
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', iconBg, iconText)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-bold tabular-nums text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  );
}

/**
 * Three-stat learner heads-up: streak, minutes studied today, pomodoros done.
 * Empty states stay encouraging ("Start your first session") instead of
 * showing a bare zero.
 */
export function CMFASStudyStatsStrip() {
  const { user } = useAuth();
  const { minutes } = useCMFASMinutesToday();
  const { sessionsToday } = useCMFASStudy();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) {
      setStreak(0);
      return;
    }
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

  const hasStreak = streak > 0;
  const hasMinutes = minutes > 0;
  const hasSessions = sessionsToday > 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        icon={<Flame className="h-5 w-5" />}
        label="Study streak"
        value={hasStreak ? `${streak} day${streak === 1 ? '' : 's'}` : 'Start one today'}
        sub={hasStreak ? 'Keep showing up' : 'Study once today to begin'}
        tone={hasStreak ? 'accent' : 'neutral'}
      />
      <StatCard
        icon={<Timer className="h-5 w-5" />}
        label="Minutes today"
        value={hasMinutes ? `${minutes} min` : 'Not yet'}
        sub={hasMinutes ? 'On CMFAS lessons' : 'Open a lesson to count time'}
        tone={hasMinutes ? 'positive' : 'neutral'}
      />
      <StatCard
        icon={<Target className="h-5 w-5" />}
        label="Pomodoros today"
        value={hasSessions ? `${sessionsToday}` : 'None yet'}
        sub={hasSessions ? 'Focus sessions completed' : 'Try one 25-min session'}
        tone={hasSessions ? 'positive' : 'neutral'}
      />
    </div>
  );
}
