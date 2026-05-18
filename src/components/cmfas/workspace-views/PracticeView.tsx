import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { cmfasRoom } from '../cmfasTheme';

export function PracticeView() {
  return (
    <div className="space-y-6">
      <header>
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
          Practice
        </p>
        <h1 className={cn('mt-2 font-serif text-3xl font-bold sm:text-4xl', cmfasRoom.text)}>
          Learn by doing.
        </h1>
        <p className={cn('mt-2 max-w-xl text-sm', cmfasRoom.textMuted)}>
          Don't read the textbook cover to cover. Do questions, then look up what you got wrong.
        </p>
      </header>

      <Link
        to="/cmfas-exams"
        className={cn(
          'flex items-center justify-between gap-3 rounded-2xl border p-5 transition-colors',
          cmfasRoom.surface,
          cmfasRoom.surfaceHover,
        )}
      >
        <div className="min-w-0">
          <p className={cn('text-sm font-semibold', cmfasRoom.text)}>
            iRecruit question bank and @cmfas_bot now live on Study Tips.
          </p>
          <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
            Open Study Tips to grab the daily-use links and the 8-step routine in one place.
          </p>
        </div>
        <ChevronRight className={cn('h-4 w-4 shrink-0', cmfasRoom.brassText)} />
      </Link>
    </div>
  );
}
