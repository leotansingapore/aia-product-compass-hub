import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { moduleIdToProductId, getCMFASModuleName } from '@/data/cmfasModuleData';

const PAPERS = [
  { id: 'm9', code: 'M9', tagline: 'Life Insurance & Investment-Linked Policies' },
  { id: 'm9a', code: 'M9A', tagline: 'Life Insurance II — Structured Products & Derivatives' },
  { id: 'hi', code: 'HI', tagline: 'Health Insurance' },
  { id: 'res5', code: 'RES5', tagline: 'Rules, Ethics & Skills for Financial Advisory' },
] as const;

/**
 * Admin tab 1 — Modules. Picker of the four CMFAS papers. Clicking a card
 * deep-links into the canonical `/product/:id/manage-videos` editor — the
 * SKOOL-style rich-editor surface admins already use for every other
 * product. A single editing process for CMFAS lessons: one UI, one save
 * target, no duplicated widgets.
 */
export function AdminModulesTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">The four CMFAS papers</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Pick a paper to edit its lessons. You'll land in the same rich editor used for every
          other product — add, edit, reorder, embed Loom / YouTube videos, write rich content.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PAPERS.map((paper) => {
          const productId = moduleIdToProductId[paper.id];
          return (
            <Link
              key={paper.id}
              to={`/product/${productId}/manage-videos`}
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
                    Opens the rich lesson editor.
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
