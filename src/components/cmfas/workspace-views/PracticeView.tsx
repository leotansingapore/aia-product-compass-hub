import { ExternalLink, MessageCircle, ScrollText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { cmfasRoom } from '../cmfasTheme';

const FLASHCARD_DECKS = [
  { paper: 'M9', url: 'https://revisely.com/flashcards/decks/R9ikkh' },
  { paper: 'M9A', url: 'https://revisely.com/flashcards/decks/CVxXJ7' },
  { paper: 'HI', url: 'https://revisely.com/flashcards/decks/4Bz9fm' },
  { paper: 'RES5', url: 'https://revisely.com/flashcards/decks/1KxDpT' },
];

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

        {/* Flashcards */}
        <div
          className={cn(
            'rounded-2xl border p-5 md:col-span-2',
            cmfasRoom.surface,
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2', cmfasRoom.brassBorder)}>
              <Sparkles className={cn('h-6 w-6', cmfasRoom.brassText)} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={cn('text-base font-semibold', cmfasRoom.text)}>Flashcards</h3>
              <p className={cn('mt-1 text-xs', cmfasRoom.textMuted)}>
                Fast review of the key definitions and frameworks per paper.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {FLASHCARD_DECKS.map((deck) => (
                  <a
                    key={deck.paper}
                    href={deck.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                      cmfasRoom.brassBorderSoft,
                      cmfasRoom.text,
                      cmfasRoom.brassBgHover,
                    )}
                  >
                    <span>{deck.paper}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
