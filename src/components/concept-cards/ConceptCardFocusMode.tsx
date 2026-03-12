import { useState, useEffect, useCallback } from 'react';
import { ConceptCard } from '@/hooks/useConceptCards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, ChevronLeft, ChevronRight, CheckCircle, XCircle,
  RotateCcw, GraduationCap, Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  cards: ConceptCard[];
  initialIndex?: number;
  onClose: () => void;
  onKnow?: (id: string) => void;
  onReview?: (id: string) => void;
  knownIds: Set<string>;
  reviewIds: Set<string>;
}

export function ConceptCardFocusMode({
  cards, initialIndex = 0, onClose,
  onKnow, onReview, knownIds, reviewIds,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [flipped, setFlipped] = useState(false);
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const card = cards[index];
  const total = cards.length;
  const progress = ((index + 1) / total) * 100;
  const knownCount = cards.filter(c => knownIds.has(c.id)).length;
  const reviewCount = cards.filter(c => reviewIds.has(c.id)).length;

  const goNext = useCallback((dir: 'left' | 'right' = 'right') => {
    if (index >= total - 1) return;
    setAnimDir(dir);
    setTimeout(() => {
      setIndex(i => i + 1);
      setFlipped(false);
      setAnimDir(null);
      setImgIndex(0);
    }, 180);
  }, [index, total]);

  const goPrev = useCallback(() => {
    if (index <= 0) return;
    setAnimDir('left');
    setTimeout(() => {
      setIndex(i => i - 1);
      setFlipped(false);
      setAnimDir(null);
      setImgIndex(0);
    }, 180);
  }, [index]);

  const handleKnow = useCallback(() => {
    if (!card) return;
    onKnow?.(card.id);
    toast.success('Marked as known! 🎉', { duration: 1200 });
    goNext('right');
  }, [card, onKnow, goNext]);

  const handleReview = useCallback(() => {
    if (!card) return;
    onReview?.(card.id);
    goNext('right');
  }, [card, onReview, goNext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped(f => !f);
        return;
      }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleKnow(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handleReview(); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); goPrev(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); goNext(); return; }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKnow, handleReview, goPrev, goNext, onClose]);

  if (!card) return null;

  const isKnown = knownIds.has(card.id);
  const isReview = reviewIds.has(card.id);
  const allDone = knownCount + reviewCount === total;

  // Normalise images for current card
  const cardImages: string[] = (card.image_urls && card.image_urls.length > 0)
    ? card.image_urls
    : card.image_url ? [card.image_url] : [];
  const safeImgIndex = Math.min(imgIndex, cardImages.length - 1);
  const currentImg = cardImages[safeImgIndex] ?? null;

  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-sm flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b bg-card/80 backdrop-blur-sm shrink-0">
        <GraduationCap className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold hidden sm:block">Focus Mode</span>

        {/* Progress bar */}
        <div className="flex-1 max-w-xs">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {index + 1} / {total}
        </span>

        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
          <span className="font-semibold text-green-600 dark:text-green-400">{knownCount} ✓</span>
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">{reviewCount} ◷</span>
        </div>

        <button
          onClick={() => setShowKeys(v => !v)}
          className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/60 hover:border-border"
        >
          <Keyboard className="h-3.5 w-3.5" />
          Keys
        </button>

        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Keyboard hint */}
      {showKeys && (
        <div className="flex flex-wrap gap-2 px-6 py-2 bg-muted/30 border-b text-xs text-muted-foreground shrink-0">
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Space</kbd> flip ·&nbsp;
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">→</kbd> Know it ·&nbsp;
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">←</kbd> Review later ·&nbsp;
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd> Navigate ·&nbsp;
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Esc</kbd> Exit
        </div>
      )}

      {/* Session complete banner */}
      {allDone && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 flex items-center gap-3 shrink-0">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">Session complete! 🎉</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {knownCount} known · {reviewCount} to review
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={onClose} className="text-xs border-green-300 dark:border-green-700">
            Done
          </Button>
        </div>
      )}

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-12 py-6 overflow-hidden">
        <div className="w-full max-w-2xl" style={{ perspective: '1400px' }}>

          {/* Card navigator row */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="p-2 rounded-full border border-border hover:border-primary/60 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* 3D Flip Card */}
            <div className="flex-1" style={{ perspective: '1200px' }}>
              <div
                className={cn(
                  "relative w-full transition-all duration-500 cursor-pointer",
                  animDir === 'right' && "translate-x-4 opacity-0",
                  animDir === 'left' && "-translate-x-4 opacity-0",
                )}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  minHeight: '340px',
                  transition: animDir ? 'all 0.18s ease' : 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onClick={() => setFlipped(f => !f)}
              >
                {/* FRONT */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl border-2 bg-card shadow-lg p-6 sm:p-8 flex flex-col",
                    isKnown && "border-green-400/50 dark:border-green-600/40",
                    isReview && !isKnown && "border-yellow-400/50 dark:border-yellow-600/40",
                    !isKnown && !isReview && "border-border",
                  )}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Status badge */}
                  {(isKnown || isReview) && (
                    <div className={cn(
                      "absolute top-3 right-3 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
                      isKnown
                        ? "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800"
                        : "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800"
                    )}>
                      {isKnown ? <><CheckCircle className="h-3 w-3" /> Known</> : <><RotateCcw className="h-3 w-3" /> Review</>}
                    </div>
                  )}

                  <div className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest mb-3">
                    Question
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold leading-snug flex-1">{card.title}</h2>
                  {card.description && (
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{card.description}</p>
                  )}

                  {/* Image preview hint */}
                  {card.image_url ? (
                    <div className="mt-4 rounded-xl overflow-hidden border border-dashed border-border/60 h-20 flex items-center justify-center relative bg-muted/20">
                      <img src={card.image_url} alt="" className="absolute inset-0 w-full h-full object-contain blur-md opacity-30" />
                      <span className="relative z-10 text-xs text-muted-foreground font-medium">
                        Tap to reveal drawing ↻
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl bg-muted/20 border border-dashed border-border/50 h-16 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No drawing attached</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {card.audience.map(a => (
                      <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                    ))}
                    {card.product_type.map(p => (
                      <Badge key={p} className="text-xs bg-primary/10 text-primary border-primary/20">{p}</Badge>
                    ))}
                  </div>
                </div>

                {/* BACK */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-border bg-card shadow-lg overflow-hidden cursor-pointer"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  onClick={() => setFlipped(false)}
                >
                  <div className="absolute top-3 left-3 z-10 text-[10px] font-semibold text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded border border-border/40">
                    Drawing {cardImages.length > 1 ? `${safeImgIndex + 1}/${cardImages.length}` : ''}
                  </div>
                  <div className="absolute top-3 right-3 z-10 text-[10px] text-muted-foreground bg-background/70 px-1.5 py-0.5 rounded border border-border/40">
                    tap to flip back ↻
                  </div>
                  {currentImg
                    ? <img src={currentImg} alt={card.title} className="w-full h-full object-contain p-4 pointer-events-none" />
                    : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm pointer-events-none">No drawing yet</div>
                  }
                  {/* Multi-image nav */}
                  {cardImages.length > 1 && (
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-20" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setImgIndex(i => Math.max(0, i - 1))} disabled={safeImgIndex === 0}
                        className="p-1 rounded-lg bg-background/80 border border-border text-muted-foreground disabled:opacity-30 hover:border-primary/60 transition-colors">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex gap-1">
                        {cardImages.map((_, i) => (
                          <button key={i} onClick={() => setImgIndex(i)}
                            className={cn("w-1.5 h-1.5 rounded-full transition-colors",
                              i === safeImgIndex ? "bg-primary" : "bg-muted-foreground/40 hover:bg-muted-foreground/70")} />
                        ))}
                      </div>
                      <button onClick={() => setImgIndex(i => Math.min(cardImages.length - 1, i + 1))} disabled={safeImgIndex === cardImages.length - 1}
                        className="p-1 rounded-lg bg-background/80 border border-border text-muted-foreground disabled:opacity-30 hover:border-primary/60 transition-colors">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => goNext()}
              disabled={index === total - 1}
              className="p-2 rounded-full border border-border hover:border-primary/60 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center mt-2">
            <button
              onClick={handleReview}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border shadow-sm",
                isReview
                  ? "bg-yellow-500 text-white border-yellow-600 shadow-yellow-200 dark:shadow-none"
                  : "bg-card text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-950/40"
              )}
            >
              <XCircle className="h-4 w-4" />
              <span>Review later</span>
              <kbd className="hidden sm:inline text-[10px] px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 rounded border border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400">←</kbd>
            </button>

            <button
              onClick={handleKnow}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border shadow-sm",
                isKnown
                  ? "bg-green-600 text-white border-green-700 shadow-green-200 dark:shadow-none"
                  : "bg-card text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950/40"
              )}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Know it!</span>
              <kbd className="hidden sm:inline text-[10px] px-1 py-0.5 bg-green-100 dark:bg-green-900/40 rounded border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400">→</kbd>
            </button>
          </div>

          {/* Flip hint */}
          {card.image_url && !flipped && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">Space</kbd> to flip card
            </p>
          )}

          {/* Dot nav */}
          <div className="flex justify-center gap-1 mt-4 overflow-hidden max-w-full">
            {cards.slice(Math.max(0, index - 4), Math.min(total, index + 5)).map((c, i) => {
              const realIndex = Math.max(0, index - 4) + i;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setAnimDir(realIndex > index ? 'right' : 'left');
                    setTimeout(() => { setIndex(realIndex); setFlipped(false); setAnimDir(null); }, 180);
                  }}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    realIndex === index ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/60",
                    knownIds.has(c.id) && realIndex !== index && "bg-green-400/60",
                    reviewIds.has(c.id) && !knownIds.has(c.id) && realIndex !== index && "bg-yellow-400/60",
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
