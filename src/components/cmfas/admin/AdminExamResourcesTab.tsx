import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useProductUpdate } from '@/hooks/useProductUpdate';
import { CMFASUsefulLinks } from '@/components/cmfas/CMFASUsefulLinks';
import { moduleIdToProductId } from '@/data/cmfasModuleData';
import type { UsefulLink } from '@/hooks/useProducts';

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

/**
 * Admin tab 2 — Exam resources. Focused editor for the per-paper
 * `useful_links` and `custom_gpt_link` on `products`. Same data source as
 * the Modules tab, just narrower scope for admins thinking "I'm managing
 * external resources" as a separate task from "I'm managing lessons".
 */
export function AdminExamResourcesTab() {
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
    return <PaperResourcesEditor paperId={selected} onBack={() => select(null)} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">Exam resources per paper</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          External links learners see inside each paper's module page — study guides, MAS
          regulations, past-paper mocks, and the paper's custom GPT chatbot link.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PAPERS.map((paper) => (
          <button
            key={paper.id}
            type="button"
            onClick={() => select(paper.id)}
            className={cn(
              'group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all',
              'hover:border-primary/40 hover:shadow-md',
            )}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-primary/40">
              <span className="font-serif text-base font-bold tracking-tight text-primary">
                {paper.code}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold">{paper.code} useful links</h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {paper.tagline}
              </p>
            </div>
            <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}

function PaperResourcesEditor({ paperId, onBack }: { paperId: PaperId; onBack: () => void }) {
  const { updateProduct } = useProductUpdate();
  const productId = moduleIdToProductId[paperId];
  const paper = PAPERS.find((p) => p.id === paperId)!;
  const [links, setLinks] = useState<UsefulLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('useful_links')
        .eq('id', productId)
        .maybeSingle();
      if (cancelled) return;
      if (!error && data?.useful_links && Array.isArray(data.useful_links)) {
        setLinks(data.useful_links as UsefulLink[]);
      } else {
        setLinks([]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleUpdate = async (field: string, value: unknown) => {
    if (field === 'useful_links') {
      setLinks(value as UsefulLink[]);
      await updateProduct(productId, 'useful_links', value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="h-9 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All papers
        </Button>
        <div className="min-w-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {paper.code}
          </p>
          <p className="truncate text-xs text-muted-foreground">{paper.tagline}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card px-5 py-10 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading resources…
        </div>
      ) : (
        <CMFASUsefulLinks links={links} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
