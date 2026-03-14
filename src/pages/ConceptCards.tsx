import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { BrandedPageHeader } from '@/components/layout/BrandedPageHeader';
import { ScriptsTabBar } from '@/components/scripts/ScriptsTabBar';
import { useConceptCards, ConceptCard } from '@/hooks/useConceptCards';
import { useConceptCardsMutations } from '@/hooks/useConceptCards';
import { usePermissions } from '@/hooks/usePermissions';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { ConceptCardUploadDialog } from '@/components/concept-cards/ConceptCardUploadDialog';
import { ConceptCardFocusMode } from '@/components/concept-cards/ConceptCardFocusMode';
import { ConceptCardViewDialog } from '@/components/concept-cards/ConceptCardViewDialog';
import { ConceptCardEditDialog } from '@/components/concept-cards/ConceptCardEditDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus, Search, ImageIcon, Trash2, GraduationCap, RotateCcw,
  CheckCircle, XCircle, Pencil, BookmarkCheck, Focus, CalendarClock, Flame, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AUDIENCE_OPTIONS = ['All', 'NSF / NS', 'Young Adults', 'Working Adults', 'Pre-Retirees (50-65)', 'Parents', 'General'];
const PRODUCT_OPTIONS = ['All', 'Investment', 'Endowment', 'Whole Life', 'Term', 'Medical', 'Critical Illness', 'General'];

// ─── Flash Card (3D flip) ──────────────────────────────────────────────────
function FlashCard({
  card, onOpen, onDraw, onDelete, onEdit, isAdmin, quizMode,
  onKnow, onReview, isKnown, isReview,
}: {
  card: ConceptCard;
  onOpen: (card: ConceptCard) => void;
  onDraw: (card: ConceptCard) => void;
  onDelete: (id: string) => void;
  onEdit: (card: ConceptCard) => void;
  isAdmin: boolean;
  quizMode: boolean;
  onKnow?: (id: string) => void;
  onReview?: (id: string) => void;
  isKnown: boolean;
  isReview: boolean;
}) {
  // 3-step carousel: 0 = Question, 1 = Drawing, 2 = Explanation
  const [step, setStep] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);

  // Normalise: prefer image_urls array, fall back to legacy image_url
  const allImages: string[] = (card.image_urls && card.image_urls.length > 0)
    ? card.image_urls
    : card.image_url ? [card.image_url] : [];
  const hasImages = allImages.length > 0;
  const currentImg = allImages[imgIndex] ?? null;

  const goToStep = (s: number) => setStep(Math.max(0, Math.min(2, s)));

  const PANEL_HEIGHT = 260;

  return (
    <div className="group relative">
      {/* Quiz status indicator */}
      {quizMode && (isKnown || isReview) && (
        <div className={cn(
          "absolute -top-2 -right-2 z-30 w-6 h-6 rounded-full flex items-center justify-center shadow-sm border-2 border-background",
          isKnown ? "bg-green-500" : "bg-yellow-500"
        )}>
          {isKnown
            ? <CheckCircle className="h-3.5 w-3.5 text-white" />
            : <XCircle className="h-3.5 w-3.5 text-white" />
          }
        </div>
      )}

      {/* Card */}
      <div className={cn(
        "rounded-2xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md relative",
        isKnown && quizMode && "opacity-60",
      )} style={{ height: `${PANEL_HEIGHT}px` }}>


        {/* Panels — absolute positioned so width always = card width */}
        <div className="relative w-full h-full">
          {/* PANEL 1 — Question */}
          <div
            className="absolute inset-0 p-4 sm:p-5 flex flex-col cursor-pointer"
            style={{
              opacity: step === 0 ? 1 : 0,
              pointerEvents: step === 0 ? 'auto' : 'none',
              transform: `translateX(${(0 - step) * 100}%)`,
              transition: 'transform 0.3s ease-in-out, opacity 0.3s',
            }}
            onClick={() => hasImages ? goToStep(1) : goToStep(2)}
          >
            <div className="flex-1 pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wide">Question</span>
                <span className="text-[9px] text-muted-foreground/50 ml-auto">tap to continue →</span>
              </div>
              <h3 className="font-semibold text-sm sm:text-base leading-snug">{card.title}</h3>
            </div>
            {hasImages ? (
              <div className="mt-3 rounded-lg overflow-hidden border border-dashed border-border/50 h-20 flex items-center justify-center relative bg-muted/20">
                <img src={currentImg!} alt="" className="absolute inset-0 w-full h-full object-contain blur-sm opacity-40" />
                <span className="relative z-10 text-xs text-muted-foreground font-medium">
                  Tap to reveal {allImages.length > 1 ? `${allImages.length} drawings` : 'drawing'}
                </span>
              </div>
            ) : (
              <div className="mt-3 rounded-lg bg-muted/30 border border-dashed border-border/50 h-14 flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-1">
              {card.audience.slice(0, 2).map(a => (
                <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">{a}</Badge>
              ))}
              {card.product_type.slice(0, 2).map(p => (
                <Badge key={p} className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">{p}</Badge>
              ))}
            </div>
          </div>

          {/* PANEL 2 — Drawing(s) */}
          {/* PANEL 2 — Drawing(s): tap anywhere to go to next step */}
          <div
            className="absolute inset-0 cursor-pointer"
            style={{
              opacity: step === 1 ? 1 : 0,
              pointerEvents: step === 1 ? 'auto' : 'none',
              transform: `translateX(${(1 - step) * 100}%)`,
              transition: 'transform 0.3s ease-in-out, opacity 0.3s',
            }}
            onClick={() => goToStep(2)}
          >
            <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
              <button onClick={e => { e.stopPropagation(); onOpen(card); }}
                className="text-[9px] text-primary/70 bg-background/80 px-1.5 py-0.5 rounded-md border border-primary/20 hover:border-primary/50 transition-colors">
                full view
              </button>
            </div>
            <div className="absolute bottom-2 left-2 z-10" onClick={e => e.stopPropagation()}>
              <button onClick={e => { e.stopPropagation(); onDraw(card); }}
                className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-2 py-1 rounded-lg transition-colors shadow-sm">
                <Pencil className="h-3 w-3" /> Draw &amp; Compare
              </button>
            </div>
            <div className="absolute bottom-2 right-2 z-10 text-[9px] text-muted-foreground/50 pointer-events-none">tap →</div>
            {hasImages ? (
              <>
                <img src={currentImg!} alt={card.title} className="w-full h-full object-contain p-2 pointer-events-none" />
                {allImages.length > 1 && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={e => { e.stopPropagation(); setImgIndex(i => Math.max(0, i - 1)); }} disabled={imgIndex === 0}
                      className="p-0.5 rounded bg-background/80 border border-border/60 text-muted-foreground disabled:opacity-30">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-[9px] bg-background/80 px-1.5 py-0.5 rounded-md border border-border/40 text-muted-foreground tabular-nums">{imgIndex + 1}/{allImages.length}</span>
                    <button onClick={e => { e.stopPropagation(); setImgIndex(i => Math.min(allImages.length - 1, i + 1)); }} disabled={imgIndex === allImages.length - 1}
                      className="p-0.5 rounded bg-background/80 border border-border/60 text-muted-foreground disabled:opacity-30">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm pointer-events-none">No drawing yet</div>
            )}
          </div>

          {/* PANEL 3 — Explanation: tap to loop back to question */}
          <div
            className="absolute inset-0 p-4 sm:p-5 flex flex-col cursor-pointer"
            style={{
              opacity: step === 2 ? 1 : 0,
              pointerEvents: step === 2 ? 'auto' : 'none',
              transform: `translateX(${(2 - step) * 100}%)`,
              transition: 'transform 0.3s ease-in-out, opacity 0.3s',
            }}
            onClick={() => goToStep(0)}
          >
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Explanation</span>
                <span className="text-[9px] text-muted-foreground/50 ml-auto">tap to restart →</span>
              </div>
              {card.description ? (
                <p className="text-sm text-foreground leading-relaxed">{card.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No explanation added yet.</p>
              )}
            </div>
            <div className="pt-3 flex flex-wrap gap-1">
              {card.audience.slice(0, 2).map(a => (
                <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">{a}</Badge>
              ))}
              {card.product_type.slice(0, 2).map(p => (
                <Badge key={p} className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">{p}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quiz action buttons */}
      {quizMode && step > 0 && (
        <div
          className="absolute -bottom-12 inset-x-0 flex gap-2 justify-center z-20 animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { onKnow?.(card.id); setStep(0); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-md"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Know it
          </button>
          <button
            onClick={() => { onReview?.(card.id); setStep(0); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500 text-white hover:bg-yellow-600 transition-colors shadow-md"
          >
            <XCircle className="h-3.5 w-3.5" /> Review later
          </button>
        </div>
      )}

      {/* Admin actions (hover) */}
      {isAdmin && !quizMode && (
        <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onEdit(card); }}
            className="p-1.5 rounded-lg bg-background/90 border border-border/60 hover:border-primary/60 hover:text-primary text-muted-foreground transition-colors shadow-sm"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(card.id); }}
            className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Banner ───────────────────────────────────────────────────────────
function QuizBanner({
  total, known, reviewing, onReset, onShowReview, showingReview,
}: {
  total: number;
  known: number;
  reviewing: number;
  onReset: () => void;
  onShowReview: () => void;
  showingReview: boolean;
}) {
  const remaining = total - known - reviewing;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-card mb-5 text-sm flex-wrap">
      <GraduationCap className="h-4 w-4 text-primary shrink-0" />
      <span className="font-medium">Quiz Mode</span>
      <span className="text-muted-foreground">—</span>
      <span className="font-semibold text-green-600 dark:text-green-400">{known} know it</span>
      <button
        onClick={onShowReview}
        className={cn(
          "font-semibold text-yellow-600 dark:text-yellow-400 hover:underline transition-all",
          showingReview && "underline"
        )}
      >
        {reviewing} review later
      </button>
      <span className="text-muted-foreground">{remaining} remaining</span>
      {(known + reviewing) > 0 && (
        <button onClick={onReset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      )}
      {known + reviewing === total && total > 0 && (
        <Badge className="ml-auto bg-green-600 text-white">✓ Session complete!</Badge>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ConceptCardsPage() {
  const { cards, loading, refetch } = useConceptCards();
  const { deleteCard } = useConceptCardsMutations();
  const { isAdmin } = usePermissions();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewCard, setViewCard] = useState<ConceptCard | null>(null);
  const [drawCard, setDrawCard] = useState<ConceptCard | null>(null);
  const [editCard, setEditCard] = useState<ConceptCard | null>(null);
  const [search, setSearch] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterProduct, setFilterProduct] = useState('All');
  const [quizMode, setQuizMode] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());
  const [showReviewOnly, setShowReviewOnly] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [dueOnlyMode, setDueOnlyMode] = useState(false);

  // Spaced repetition
  const { dueCards, reviewStats } = useSpacedRepetition(cards);

  const filtered = useMemo(() => {
    let result = cards.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags.some(t => t.includes(q));
      const matchAudience = filterAudience === 'All' || c.audience.includes(filterAudience);
      const matchProduct = filterProduct === 'All' || c.product_type.includes(filterProduct);
      return matchSearch && matchAudience && matchProduct;
    });
    if (showReviewOnly && quizMode) {
      result = result.filter(c => reviewIds.has(c.id));
    }
    return result;
  }, [cards, search, filterAudience, filterProduct, showReviewOnly, quizMode, reviewIds]);

  // Cards to use in focus mode — either due-only subset or all filtered
  const focusCards = dueOnlyMode
    ? dueCards.filter(c => filtered.some(f => f.id === c.id))
    : filtered;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this concept card?')) return;
    const ok = await deleteCard(id);
    if (ok) refetch();
  };

  const handleKnow = (id: string) => {
    setKnownIds(prev => new Set([...prev, id]));
    setReviewIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    toast.success('Marked as known! 🎉');
  };

  const handleReview = (id: string) => {
    setReviewIds(prev => new Set([...prev, id]));
    setKnownIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const resetQuiz = () => {
    setKnownIds(new Set());
    setReviewIds(new Set());
    setShowReviewOnly(false);
  };

  const toggleReviewFilter = () => {
    if (reviewIds.size === 0) return;
    setShowReviewOnly(v => !v);
  };

  return (
    <PageLayout title="Concept Cards — FINternship" description="Visual concept flashcards for financial advisors">
      <BrandedPageHeader
        title="Concept Cards"
        titlePrefix="🃏 "
        subtitle="Visual concept drawings as flashcards — tap to flip and reveal the drawing"
        showBackButton={false}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Concept Cards' }]}
      />

      <div className="mx-auto px-3 md:px-6 py-3 md:py-8 max-w-5xl overflow-x-hidden">
        <div className="hidden md:block"><ScriptsTabBar /></div>

        {/* Toolbar — row 1: search + filters */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search concept cards..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {isAdmin() && (
              <Button onClick={() => setUploadOpen(true)} className="shrink-0">
                <Plus className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Add Card</span>
              </Button>
            )}
          </div>

          {/* Filters + action buttons row */}
          <div className="flex flex-wrap gap-2 min-w-0">
            <Select value={filterAudience} onValueChange={setFilterAudience}>
              <SelectTrigger className="w-[120px] xs:w-[140px] sm:w-44 text-xs h-9 min-w-0">
                <span className="text-muted-foreground text-xs mr-1 shrink-0 hidden xs:inline">Audience:</span>
                <span className="text-muted-foreground text-xs mr-1 shrink-0 xs:hidden">👥</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-[110px] xs:w-[130px] sm:w-40 text-xs h-9 min-w-0">
                <span className="text-muted-foreground text-xs mr-1 shrink-0 hidden xs:inline">Product:</span>
                <span className="text-muted-foreground text-xs mr-1 shrink-0 xs:hidden">📦</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={quizMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setQuizMode(q => !q); resetQuiz(); }}
                    className="gap-1.5 h-9"
                  >
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    <span className="hidden xs:inline">{quizMode ? 'Exit Quiz' : 'Quiz Mode'}</span>
                    <span className="xs:hidden">{quizMode ? 'Exit' : 'Quiz'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px] text-center text-xs">
                  Flip cards one by one and self-mark each as "Know it" or "Review". Tracks your progress across the deck.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {filtered.length > 0 && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setDueOnlyMode(false); setFocusMode(true); }}
                      className="gap-1.5 h-9"
                    >
                      <Focus className="h-4 w-4 shrink-0" />
                      <span className="hidden xs:inline">Focus Mode</span>
                      <span className="xs:hidden">Focus</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] text-center text-xs">
                    Full-screen session — ideal for rapid drill before an exam.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {dueCards.length > 0 && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setDueOnlyMode(true); setFocusMode(true); }}
                      className="gap-1.5 h-9 border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <CalendarClock className="h-4 w-4 shrink-0" />
                      <span className="hidden xs:inline">Study Due ({dueCards.length})</span>
                      <span className="xs:hidden">Due ({dueCards.length})</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] text-center text-xs">
                    Focus Mode showing only cards due for spaced-repetition review today.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* SRS Stats strip */}
        {cards.length > 0 && (reviewStats.dueToday > 0 || reviewStats.reviewedToday > 0) && (
          <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl border bg-card mb-4 text-sm flex-wrap">
            <CalendarClock className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium text-muted-foreground">Spaced Repetition</span>
            <span className="text-foreground font-semibold">
              {reviewStats.dueToday} due today
            </span>
            {reviewStats.reviewedToday > 0 && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" />
                  {reviewStats.reviewedToday} reviewed today
                </span>
              </>
            )}
          </div>
        )}

        {/* Quiz banner */}
        {quizMode && filtered.length > 0 && (
          <QuizBanner
            total={cards.filter(c => {
              const matchAudience = filterAudience === 'All' || c.audience.includes(filterAudience);
              const matchProduct = filterProduct === 'All' || c.product_type.includes(filterProduct);
              return matchAudience && matchProduct;
            }).length}
            known={knownIds.size}
            reviewing={reviewIds.size}
            onReset={resetQuiz}
            onShowReview={toggleReviewFilter}
            showingReview={showReviewOnly}
          />
        )}

        {/* Review-only notice */}
        {quizMode && showReviewOnly && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800 text-sm">
            <BookmarkCheck className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <span className="text-yellow-700 dark:text-yellow-300 font-medium">
              Showing {reviewIds.size} card{reviewIds.size !== 1 ? 's' : ''} marked for review
            </span>
            <button
              onClick={() => setShowReviewOnly(false)}
              className="ml-auto text-xs text-yellow-600 dark:text-yellow-400 hover:underline"
            >
              Show all
            </button>
          </div>
        )}

        {/* Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {loading ? 'Loading...' : `${filtered.length} card${filtered.length !== 1 ? 's' : ''}`}
          {quizMode && !showReviewOnly && filtered.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground/70">— Tap a card to flip, then mark yourself</span>
          )}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card h-60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl">🃏</div>
            <p className="text-muted-foreground font-medium">
              {cards.length === 0
                ? 'No concept cards yet'
                : showReviewOnly
                  ? 'No cards marked for review'
                  : 'No cards match your filters'}
            </p>
            {isAdmin() && cards.length === 0 && (
              <Button onClick={() => setUploadOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-1.5" /> Add the first card
              </Button>
            )}
            {showReviewOnly && (
              <Button variant="outline" size="sm" onClick={() => setShowReviewOnly(false)}>
                Show all cards
              </Button>
            )}
          </div>
        ) : (
          <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
            quizMode && "gap-y-16"
          )}>
            {filtered.map(card => (
              <FlashCard
                key={card.id}
                card={card}
                onOpen={setViewCard}
                onDraw={setDrawCard}
                onDelete={handleDelete}
                onEdit={setEditCard}
                isAdmin={isAdmin()}
                quizMode={quizMode}
                onKnow={handleKnow}
                onReview={handleReview}
                isKnown={knownIds.has(card.id)}
                isReview={reviewIds.has(card.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ConceptCardUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onCreated={refetch}
      />
      <ConceptCardViewDialog
        card={viewCard}
        onClose={() => setViewCard(null)}
      />
      <ConceptCardViewDialog
        card={drawCard}
        initialTab="draw"
        onClose={() => setDrawCard(null)}
      />
      <ConceptCardEditDialog
        card={editCard}
        onClose={() => setEditCard(null)}
        onUpdated={refetch}
      />
      {focusMode && focusCards.length > 0 && (
        <ConceptCardFocusMode
          cards={focusCards}
          onClose={() => { setFocusMode(false); setDueOnlyMode(false); }}
        />
      )}
    </PageLayout>
  );
}
