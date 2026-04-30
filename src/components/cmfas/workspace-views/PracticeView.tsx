import { ExternalLink, MessageCircle, ScrollText } from 'lucide-react';
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Question bank */}
        <a
          href="https://joinus.aia.com.sg/app/login"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group rounded-2xl border p-5 transition-colors',
            cmfasRoom.surface,
            cmfasRoom.surfaceHover,
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
              <ScrollText className={cn('h-6 w-6', cmfasRoom.brassText)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={cn('text-base font-semibold', cmfasRoom.text)}>iRecruit question bank</h3>
                <ExternalLink className={cn('h-3 w-3', cmfasRoom.textFaint)} />
              </div>
              <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
                The canonical CMFAS practice bank. Drill in Learning Mode — fastest way to get exam-ready.
              </p>
              <p className={cn('mt-2 text-[11px]', cmfasRoom.textFaint)}>
                Path: iLearn → Pre-Contract → Pre-Contract (Online) → CMFAS M9 → Practice Questions → Launch
              </p>
            </div>
          </div>
        </a>

        {/* AI chatbot */}
        <a
          href="https://t.me/cmfas_bot"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'group rounded-2xl border p-5 transition-colors',
            cmfasRoom.surface,
            cmfasRoom.surfaceHover,
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
              <MessageCircle className={cn('h-6 w-6', cmfasRoom.brassText)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={cn('text-base font-semibold', cmfasRoom.text)}>@cmfas_bot on Telegram</h3>
                <ExternalLink className={cn('h-3 w-3', cmfasRoom.textFaint)} />
              </div>
              <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
                24/7 AI tutor. Ask anything about the CMFAS exams — syllabus, concepts, past questions.
              </p>
            </div>
          </div>
        </a>

      </div>
    </div>
  );
}
