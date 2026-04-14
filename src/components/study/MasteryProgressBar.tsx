import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface MasteryProgressBarProps {
  mastered: number;
  total: number;
  label?: string;
  compact?: boolean;
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
}: MasteryProgressBarProps) {
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Trophy className="h-3 w-3 text-yellow-500" />
          {mastered} / {total} {label}
        </span>
        <span className="tabular-nums font-medium">{pct}%</span>
      </div>
      <Progress value={pct} className={compact ? 'h-1.5' : 'h-2'} />
    </div>
  );
}
