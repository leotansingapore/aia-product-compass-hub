import { Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cmfasRoom } from '../cmfasTheme';

type ReadyProgress = { done: number; total: number };

/**
 * “Deck” title strip: overall get-ready % + where to resume. Exam-prep presentation feel at top of Study desk.
 */
export function StudyDeskProgressHero({
  readyComplete,
  readyProgress,
  resumeLine,
  onContinueToSlides,
}: {
  readyComplete: boolean;
  readyProgress: ReadyProgress;
  /** e.g. "Step 3 — Unlock the question bank" or null if done. */
  resumeLine: string | null;
  onContinueToSlides: () => void;
}) {
  const pct = readyComplete ? 100 : Math.round((readyProgress.done / readyProgress.total) * 100);

  if (readyComplete) return null;

  return (
    <div
      className={cn(
        'mb-6 overflow-hidden rounded-2xl border-2 p-5 sm:p-6',
        cmfasRoom.brassBorderSoft,
        'bg-gradient-to-br from-[#15253f] via-[#101d35] to-[#0a1424]',
        'shadow-[inset_0_1px_0_0_rgba(212,165,116,0.12)]',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
            Exam prep — your progress
          </p>
          <h2 className={cn('mt-1 font-serif text-xl font-bold sm:text-2xl', cmfasRoom.text)}>Get ready path</h2>
          <p className={cn('mt-1 text-sm', cmfasRoom.textMuted)}>
            Work one slide at a time. Finish the step, then go next — papers and practice unlock when this is done.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className={cn('font-mono text-2xl font-bold tabular-nums', cmfasRoom.text)}>{pct}%</p>
          <p className={cn('text-xs', cmfasRoom.textFaint)}>{readyProgress.done} / {readyProgress.total} steps</p>
        </div>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#0a1424] ring-1 ring-[#b8894f]/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8b7355] to-[#d4a574] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {resumeLine && (
        <div
          className={cn(
            'mt-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
            'border-[#b8894f]/20 bg-[#0a1424]/50',
          )}
        >
          <div className="min-w-0">
            <p className={cn('text-[10px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.textFaint)}>Where you left off</p>
            <p className={cn('mt-1 text-sm font-medium leading-snug', cmfasRoom.text)}>{resumeLine}</p>
          </div>
          <Button
            type="button"
            onClick={onContinueToSlides}
            className={cn('w-full shrink-0 gap-2 font-semibold sm:w-auto', 'bg-[#d4a574] text-[#0a1424] hover:bg-[#e8bb82]')}
          >
            <Clapperboard className="h-4 w-4" />
            Continue here
          </Button>
        </div>
      )}
    </div>
  );
}
