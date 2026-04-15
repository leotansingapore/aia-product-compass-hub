import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface MasteryProgressBarProps {
  mastered: number;
  total: number;
  label?: string;
  compact?: boolean;
  /**
   * Drives the bar and trailing % (0–100). Use for “overall progress” when streaks
   * should count before a question is fully mastered. Defaults to (mastered/total)*100.
   */
  progressPercent?: number;
  /** Optional one-line note under the bar (non-compact only). */
  hint?: string;
}

/**
 * Shows a mastery ratio with a progress bar. Used on the QuestionBanks listing,
 * the per-product study page header, and inside study sessions.
 */
export function MasteryProgressBar({
  mastered,
  total,
  label = 'mastered',
  compact = false,
  progressPercent: progressPercentProp,
  hint,
}: MasteryProgressBarProps) {
  const masteredOnlyPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const barPct =
    progressPercentProp !== undefined ? progressPercentProp : masteredOnlyPct;
  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Trophy className="h-3 w-3 text-yellow-500" />
          {mastered} / {total} {label}
        </span>
        <span className="tabular-nums font-medium">{barPct}%</span>
      </div>
      <Progress value={barPct} className={compact ? 'h-1.5' : 'h-2'} />
      {hint && !compact ? (
        <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>
      ) : null}
    </div>
  );
}
