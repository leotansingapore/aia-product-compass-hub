import { lazy, Suspense } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { moduleIdToProductId, getCMFASModuleName } from '@/data/cmfasModuleData';

const M9Module = lazy(() => import('@/pages/cmfas/M9Module'));
const M9AModule = lazy(() => import('@/pages/cmfas/M9AModule'));
const HIModule = lazy(() => import('@/pages/cmfas/HIModule'));
const RES5Module = lazy(() => import('@/pages/cmfas/RES5Module'));

const PAPERS = [
  { id: 'm9', code: 'M9', tagline: 'Life Insurance & Investment-Linked Policies' },
  { id: 'm9a', code: 'M9A', tagline: 'Life Insurance II — Structured Products & Derivatives' },
  { id: 'hi', code: 'HI', tagline: 'Health Insurance' },
  { id: 'res5', code: 'RES5', tagline: 'Rules, Ethics & Skills for Financial Advisory' },
] as const;

type PaperId = (typeof PAPERS)[number]['id'];
const PAPER_PARAM = 'paper';

function isPaperId(v: string | null): v is PaperId {
  return v != null && PAPERS.some((p) => p.id === v);
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

/**
 * Admin tab 1 — Modules.
 *
 * Paper picker → full embedded per-module view (video player, playlist, 4
 * tabs: Overview / Course contents / Useful links / Exam format). Admin edit
 * widgets are already rendered inline inside the "Course contents" panel of
 * the embedded module — add / edit / reorder / delete lessons happens there.
 *
 * A "Manage lessons" button deep-links into `/product/:id/manage-videos` —
 * the SKOOL-style canonical editor — for admins who want the full-page
 * CRUD experience (folder view, bulk reorder, action-steps editor).
 */
export function AdminModulesTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(PAPER_PARAM);
  const selected: PaperId | null = isPaperId(raw) ? raw : null;

  const select = (id: PaperId | null) => {
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

  if (selected) {
    const paper = PAPERS.find((p) => p.id === selected)!;
    const productId = moduleIdToProductId[selected];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => select(null)}
            className="h-9 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All modules
          </Button>
          <div className="flex items-center gap-3">
            <div className="min-w-0 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                {paper.code}
              </p>
              <p className="truncate text-xs text-muted-foreground">{paper.tagline}</p>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link to={`/product/${productId}/manage-videos`}>
                <Pencil className="h-4 w-4" aria-hidden />
                Manage lessons
              </Link>
            </Button>
          </div>
        </div>
        <Suspense
          fallback={
            <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground shadow-sm">
              Loading module…
            </div>
          }
        >
          {renderEmbeddedModule(selected)}
        </Suspense>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">The four CMFAS papers</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Click a paper to see its full content — lessons, syllabus, useful links, exam format
          — and edit it inline. Use <strong>Manage lessons</strong> for bulk lesson CRUD.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PAPERS.map((paper) => (
          <button
            key={paper.id}
            type="button"
            onClick={() => select(paper.id)}
            className={cn(
              'group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all',
              'hover:border-primary/40 hover:shadow-md',
            )}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-primary/40">
                <span className="font-serif text-xl font-bold tracking-tight text-primary">
                  {paper.code}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold">
                  {getCMFASModuleName(paper.id).replace(/^M9A - |^M9 - |^HI - |^RES5 - |^CMFAS /g, '')}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {paper.tagline}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground/70">
                  Open to see lessons, syllabus, useful links, exam format.
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
