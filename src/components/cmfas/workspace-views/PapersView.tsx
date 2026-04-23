import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  getCMFASModuleName,
  getCMFASModuleVideos,
  moduleIdToProductId,
} from '@/data/cmfasModuleData';
import { cmfasRoom } from '../cmfasTheme';

// Lazy-load each module body so the 4-cards view isn't dragged down by
// the video player + tabs + charts bundle until the learner picks a paper.
const M9Module = lazy(() => import('@/pages/cmfas/M9Module'));
const M9AModule = lazy(() => import('@/pages/cmfas/M9AModule'));
const HIModule = lazy(() => import('@/pages/cmfas/HIModule'));
const RES5Module = lazy(() => import('@/pages/cmfas/RES5Module'));

const PAPER_PARAM = 'paper';

const PAPERS: Array<{
  id: keyof typeof moduleIdToProductId;
  code: string;
  tagline: string;
}> = [
  { id: 'm9', code: 'M9', tagline: 'Life Insurance & Investment-Linked Policies' },
  { id: 'm9a', code: 'M9A', tagline: 'Life Insurance II — Structured Products & Derivatives' },
  { id: 'hi', code: 'HI', tagline: 'Health Insurance' },
  { id: 'res5', code: 'RES5', tagline: 'Rules, Ethics & Skills for Financial Advisory' },
];

type PaperId = (typeof PAPERS)[number]['id'];

function isPaperId(value: string | null): value is PaperId {
  return value != null && PAPERS.some((p) => p.id === value);
}

function renderEmbeddedModule(paperId: PaperId) {
  switch (paperId) {
    case 'm9':
      return <M9Module embedded />;
    case 'm9a':
      return <M9AModule embedded />;
    case 'hi':
      return <HIModule embedded />;
    case 'res5':
      return <RES5Module embedded />;
  }
}

/** Picker surface — 4 cards → full view swap into the selected paper's module body. */
export function PapersView() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [progressMap, setProgressMap] = useState<Record<string, { completed: number; total: number }>>({});

  const videoCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const paper of PAPERS) {
      map[paper.id] = getCMFASModuleVideos(paper.id).length;
    }
    return map;
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const productIds = PAPERS.map((p) => moduleIdToProductId[p.id]);
      const { data, error } = await supabase
        .from('video_progress')
        .select('product_id, completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('product_id', productIds);
      if (cancelled || error) return;
      const counts: Record<string, number> = {};
      (data ?? []).forEach((row: { product_id: string }) => {
        counts[row.product_id] = (counts[row.product_id] ?? 0) + 1;
      });
      const map: Record<string, { completed: number; total: number }> = {};
      for (const paper of PAPERS) {
        const pid = moduleIdToProductId[paper.id];
        map[paper.id] = {
          completed: counts[pid] ?? 0,
          total: videoCounts[paper.id] ?? 0,
        };
      }
      setProgressMap(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, videoCounts]);

  const rawPaperParam = searchParams.get(PAPER_PARAM);
  const selectedPaperId: PaperId | null = isPaperId(rawPaperParam) ? rawPaperParam : null;

  const selectPaper = (id: PaperId | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id == null) next.delete(PAPER_PARAM);
        else next.set(PAPER_PARAM, id);
        return next;
      },
      { replace: false },
    );
  };

  // ── Selected-paper view: back button + embedded module body ─────────────
  if (selectedPaperId) {
    const selectedPaper = PAPERS.find((p) => p.id === selectedPaperId)!;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => selectPaper(null)}
            className={cn('h-9 gap-2', cmfasRoom.textMuted, 'hover:text-foreground')}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All papers
          </Button>
          <div className="min-w-0 text-right">
            <p
              className={cn(
                'text-[10px] font-bold uppercase tracking-[0.2em]',
                cmfasRoom.brassText,
              )}
            >
              {selectedPaper.code}
            </p>
            <p className={cn('truncate text-xs', cmfasRoom.textMuted)}>
              {selectedPaper.tagline}
            </p>
          </div>
        </div>
        <Suspense
          fallback={
            <div className={cn('rounded-2xl border px-5 py-10 text-center text-sm', cmfasRoom.surface, cmfasRoom.textMuted)}>
              Loading module…
            </div>
          }
        >
          {renderEmbeddedModule(selectedPaperId)}
        </Suspense>
      </div>
    );
  }

  // ── 4-card picker view ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <header>
        <p className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
          The four papers
        </p>
        <h1 className={cn('mt-2 font-serif text-3xl font-bold sm:text-4xl', cmfasRoom.text)}>
          Pick your next paper.
        </h1>
        <p className={cn('mt-2 max-w-xl text-sm', cmfasRoom.textMuted)}>
          Most people start with M9. You can study in any order, but you'll sit them in the order
          you registered at SCI.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PAPERS.map((paper) => {
          const progress = progressMap[paper.id] ?? { completed: 0, total: videoCounts[paper.id] ?? 0 };
          const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
          const started = pct > 0;
          const done = pct >= 100;

          return (
            <button
              key={paper.id}
              type="button"
              onClick={() => selectPaper(paper.id)}
              className={cn(
                'group relative overflow-hidden rounded-2xl border p-5 text-left transition-all',
                cmfasRoom.surface,
                cmfasRoom.surfaceHover,
                'hover:scale-[1.01]',
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2',
                    done ? cmfasRoom.positiveBorder : cmfasRoom.brassBorder,
                  )}
                >
                  <span
                    className={cn(
                      'font-serif text-xl font-bold tracking-tight',
                      done ? cmfasRoom.positiveText : cmfasRoom.brassText,
                    )}
                  >
                    {paper.code}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={cn('truncate text-base font-semibold', cmfasRoom.text)}>
                    {getCMFASModuleName(paper.id).replace(/^M9A - |^M9 - |^HI - |^RES5 - |^CMFAS /g, '')}
                  </h3>
                  <p className={cn('mt-0.5 line-clamp-1 text-xs', cmfasRoom.textMuted)}>
                    {paper.tagline}
                  </p>
                  {progress.total > 0 && (
                    <p className={cn('mt-2 text-[11px] tabular-nums', cmfasRoom.textFaint)}>
                      {done
                        ? 'All lessons complete'
                        : started
                          ? `${progress.completed} of ${progress.total} lessons · ${pct}%`
                          : `${progress.total} lessons`}
                    </p>
                  )}
                </div>
                <ArrowRight
                  className={cn(
                    'mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                    cmfasRoom.textFaint,
                  )}
                  aria-hidden
                />
              </div>
              {started && !done && (
                <div className={cn('mt-4 h-1 w-full overflow-hidden rounded-full', 'bg-muted')}>
                  <div
                    className={cn('h-full', cmfasRoom.brassBg)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
