import { useState, useEffect, useCallback } from 'react';
import { ConceptCard } from '@/hooks/useConceptCards';
import { useSpacedRepetition, Grade, previewIntervals, formatInterval } from '@/hooks/useSpacedRepetition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, ChevronLeft, ChevronRight, CheckCircle,
  RotateCcw, GraduationCap, Keyboard, CalendarClock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  cards: ConceptCard[];
  initialIndex?: number;
  onClose: () => void;
}

const GRADE_CONFIG: { grade: Grade; label: string; key: string; color: string; activeClass: string; hoverClass: string }[] = [
  {
    grade: 'again',
    label: 'Again',
    key: '1',
    color: 'text-red-700 dark:text-red-400',
    activeClass: 'bg-red-600 text-white border-red-700',
    hoverClass: 'bg-card text-red-700 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/40',
  },
  {
    grade: 'hard',
    label: 'Hard',
    key: '2',
    color: 'text-orange-700 dark:text-orange-400',
    activeClass: 'bg-orange-500 text-white border-orange-600',
    hoverClass: 'bg-card text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40',
  },
  {
    grade: 'good',
    label: 'Good',
    key: '3',
    color: 'text-green-700 dark:text-green-400',
    activeClass: 'bg-green-600 text-white border-green-700',
    hoverClass: 'bg-card text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-950/40',
  },
  {
    grade: 'easy',
    label: 'Easy',
    key: '4',
    color: 'text-blue-700 dark:text-blue-400',
    activeClass: 'bg-blue-600 text-white border-blue-700',
    hoverClass: 'bg-card text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40',
  },
];

export function ConceptCardFocusMode({ cards, initialIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [flipped, setFlipped] = useState(false);
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [gradedIds, setGradedIds] = useState<Set<string>>(new Set());
  const [lastGradeMap, setLastGradeMap] = useState<Map<string, Grade>>(new Map());

  const { gradeCard, getReview, reviewStats } = useSpacedRepetition(cards);

  const card = cards[index];
  const total = cards.length;
  const progress = ((index + 1) / total) * 100;
  const gradedCount = gradedIds.size;

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

  const handleGrade = useCallback(async (grade: Grade) => {
    if (!card) return;
    await gradeCard(card.id, grade);
    setGradedIds(prev => new Set([...prev, card.id]));
    setLastGradeMap(prev => new Map([...prev, [card.id, grade]]));

    const labels: Record<Grade, string> = { again: '🔴 Again', hard: '🟠 Hard', good: '🟢 Good', easy: '🔵 Easy' };
    toast.success(labels[grade], { duration: 900 });
    goNext('right');
  }, [card, gradeCard, goNext]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped(f => !f);
        return;
      }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); return; }
      if (e.key === '1') { handleGrade('again'); return; }
      if (e.key === '2') { handleGrade('hard'); return; }
      if (e.key === '3') { handleGrade('good'); return; }
      if (e.key === '4') { handleGrade('easy'); return; }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleGrade, goPrev, goNext, onClose]);

  if (!card) return null;

  const review = getReview(card.id);
  const intervals = previewIntervals(
    review
      ? { ease_factor: review.ease_factor, interval_days: review.interval_days }
      : { ease_factor: 2.5, interval_days: 1 }
  );
  const lastGrade = lastGradeMap.get(card.id);
  const allDone = gradedCount === total;

  // Normalise images
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
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold text-primary">{gradedCount} graded</span>
          {reviewStats.reviewedToday > 0 && (
            <span className="hidden sm:inline text-muted-foreground/70">· {reviewStats.reviewedToday} today</span>
          )}
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
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">1</kbd> Again ·&nbsp;
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">2</kbd> Hard ·&nbsp;
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">3</kbd> Good ·&nbsp;
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">4</kbd> Easy ·&nbsp;
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">←→</kbd> Navigate ·&nbsp;
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
              {gradedCount} cards graded — intervals saved to your schedule
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
                    lastGrade === 'again' && "border-red-400/50 dark:border-red-600/40",
                    lastGrade === 'hard' && "border-orange-400/50 dark:border-orange-600/40",
                    lastGrade === 'good' && "border-green-400/50 dark:border-green-600/40",
                    lastGrade === 'easy' && "border-blue-400/50 dark:border-blue-600/40",
                    !lastGrade && "border-border",
                  )}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Last grade badge */}
                  {lastGrade && (
                    <div className={cn(
                      "absolute top-3 right-3 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
                      lastGrade === 'again' && "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800",
                      lastGrade === 'hard' && "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800",
                      lastGrade === 'good' && "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800",
                      lastGrade === 'easy' && "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800",
                    )}>
                      <RotateCcw className="h-3 w-3" />
                      {lastGrade.charAt(0).toUpperCase() + lastGrade.slice(1)}
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
                  {cardImages.length > 0 ? (
                    <div className="mt-4 rounded-xl overflow-hidden border border-dashed border-border/60 h-20 flex items-center justify-center relative bg-muted/20">
                      <img src={cardImages[0]} alt="" className="absolute inset-0 w-full h-full object-contain blur-md opacity-30" />
                      <span className="relative z-10 text-xs text-muted-foreground font-medium">
                        Tap to reveal {cardImages.length > 1 ? `${cardImages.length} drawings` : 'drawing'} ↻
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

          {/* 4-grade Action buttons */}
          <div className="flex gap-2 justify-center mt-2 flex-wrap">
            {GRADE_CONFIG.map(({ grade, label, key, activeClass, hoverClass }) => (
              <button
                key={grade}
                onClick={() => handleGrade(grade)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border shadow-sm min-w-[72px]",
                  lastGrade === grade ? activeClass : hoverClass
                )}
              >
                <span>{label}</span>
                <span className="text-[10px] font-normal opacity-70">{formatInterval(intervals[grade])}</span>
                <kbd className="hidden sm:inline text-[10px] px-1 py-0.5 bg-white/20 rounded border border-current/30 opacity-60">{key}</kbd>
              </button>
            ))}
          </div>

          {/* Flip hint */}
          {cardImages.length > 0 && !flipped && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">Space</kbd> to flip · Grade after revealing
            </p>
          )}

          {/* Dot nav */}
          <div className="flex justify-center gap-1 mt-4 overflow-hidden max-w-full">
            {cards.slice(Math.max(0, index - 4), Math.min(total, index + 5)).map((c, i) => {
              const realIndex = Math.max(0, index - 4) + i;
              const cLastGrade = lastGradeMap.get(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setAnimDir(realIndex > index ? 'right' : 'left');
                    setTimeout(() => { setIndex(realIndex); setFlipped(false); setAnimDir(null); }, 180);
                  }}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    realIndex === index ? "w-5 h-2 bg-primary" : "w-2 h-2",
                    realIndex !== index && !cLastGrade && "bg-muted-foreground/30 hover:bg-muted-foreground/60",
                    realIndex !== index && cLastGrade === 'again' && "bg-red-400/60",
                    realIndex !== index && cLastGrade === 'hard' && "bg-orange-400/60",
                    realIndex !== index && cLastGrade === 'good' && "bg-green-400/60",
                    realIndex !== index && cLastGrade === 'easy' && "bg-blue-400/60",
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
