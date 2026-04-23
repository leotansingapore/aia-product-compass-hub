import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useProductUpdate } from '@/hooks/useProductUpdate';
import { useVideoManagement } from '@/hooks/useVideoManagement';
import { VideoEditingInterface } from '@/components/video-editing/VideoEditingInterface';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { moduleIdToProductId, getCMFASModuleName } from '@/data/cmfasModuleData';
import type { TrainingVideo } from '@/hooks/useProducts';

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
 * Admin tab 1 — Modules. Paper picker → canonical `VideoEditingInterface`
 * (same component backing `/product/:id/manage-videos`) wired to the paper's
 * `products` row. Admins add / edit / reorder / categorise lessons here
 * exactly the way they do for every other product in the app.
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
    return <PaperVideoEditor paperId={selected} onBack={() => select(null)} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">The four CMFAS papers</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Pick a paper to manage its lessons. Add, edit, reorder, and organise videos the same
          way you do for any other product in the app.
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
                  Click to add, edit, or reorder this paper's lessons.
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

function PaperVideoEditor({ paperId, onBack }: { paperId: PaperId; onBack: () => void }) {
  const paper = PAPERS.find((p) => p.id === paperId)!;
  const productId = moduleIdToProductId[paperId];
  const { updateProduct } = useProductUpdate();

  const [initialVideos, setInitialVideos] = useState<TrainingVideo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from('products')
        .select('training_videos')
        .eq('id', productId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
        setLoading(false);
        return;
      }
      const videos = (data?.training_videos ?? []) as TrainingVideo[];
      setInitialVideos(videos);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleVideoSave = async (updatedVideos: TrainingVideo[]) => {
    await updateProduct(productId, 'training_videos', updatedVideos);
    setInitialVideos(updatedVideos);
  };

  const videoManagement = useVideoManagement({
    initialVideos: initialVideos ?? [],
    onSave: handleVideoSave,
    productId,
  });

  const existingCategories = Array.from(
    new Set((initialVideos ?? []).map((v) => v.category).filter(Boolean)),
  ) as string[];

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
          All modules
        </Button>
        <div className="min-w-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {paper.code}
          </p>
          <p className="truncate text-xs text-muted-foreground">{paper.tagline}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card px-5 py-16 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading {paper.code} content…
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-6 text-sm text-destructive">
          <p className="font-semibold">Couldn't load this paper's content</p>
          <p className="mt-1 text-xs opacity-80">{loadError}</p>
        </div>
      ) : (
        <ErrorBoundary>
          <VideoEditingInterface
            editVideos={videoManagement.editVideos}
            editingIndex={videoManagement.editingIndex}
            newVideo={videoManagement.newVideo}
            saving={videoManagement.saving}
            existingCategories={existingCategories}
            hasContentChanges={videoManagement.hasContentChanges}
            onEditingIndexChange={videoManagement.setEditingIndex}
            onUpdateVideo={videoManagement.updateVideo}
            onSetEditVideos={videoManagement.setEditVideos}
            onRemoveVideo={videoManagement.removeVideo}
            onMoveVideo={videoManagement.moveVideo}
            onNewVideoChange={videoManagement.setNewVideo}
            onAddVideo={videoManagement.addVideo}
            onSave={videoManagement.handleSave}
            onCancel={onBack}
            onCreateCategory={videoManagement.addEmptyFolder}
            showActionSteps={true}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
