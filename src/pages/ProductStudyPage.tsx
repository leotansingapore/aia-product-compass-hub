import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { StudyQuiz, loadWeakQuestions } from '@/components/study/StudyQuiz';
import { ArrowLeft, BookOpen, Brain, Target, Shield, MessageCircle, Shuffle, AlertTriangle, Loader2, Cloud, Trophy, Sparkles, Pencil } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { StudyResourcesSidebar } from '@/components/study/StudyResourcesSidebar';
import type { QuizQuestion } from '@/types/questionBank';
import { useQuestionProgress, QUESTION_MASTERY_STREAK } from '@/hooks/useQuestionProgress';
import type { StudyMode } from '@/components/study/StudyModePicker';
type QuizSize = 25 | 50 | 100;

function uniqueQuizPresets(poolLength: number): Array<{ preset: QuizSize; actual: number }> {
  const presets: QuizSize[] = [25, 50, 100];
  const seen = new Set<number>();
  const out: Array<{ preset: QuizSize; actual: number }> = [];
  for (const preset of presets) {
    const actual = Math.min(preset, poolLength);
    if (seen.has(actual)) continue;
    seen.add(actual);
    out.push({ preset, actual });
  }
  return out;
}
type CategoryFilter = 'all' | 'product-facts' | 'sales-angles' | 'objection-handling' | 'roleplay';

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'All Categories',
  'product-facts': 'Product Facts',
  'sales-angles': 'Sales Angles',
  'objection-handling': 'Objection Handling',
  roleplay: 'Roleplay Scenarios',
};

const categoryIcons: Record<CategoryFilter, React.ElementType> = {
  all: BookOpen,
  'product-facts': Brain,
  'sales-angles': Target,
  'objection-handling': Shield,
  roleplay: MessageCircle,
};

interface ProductStudyPageProps {
  productSlug: string;
  productTitle: string;
  backRoute: string;
  backLabel: string;
  pageId: string;
}

// Session persistence helpers
const SETUP_SESSION_KEY = (slug: string) => `study_setup_details_${slug}`;

interface SavedSetup {
  quizSize: QuizSize;
  categoryFilter: CategoryFilter;
  selectedMode: StudyMode;
  questionTexts: string[];
}

function loadSetup(productSlug: string): SavedSetup | null {
  try {
    const raw = localStorage.getItem(SETUP_SESSION_KEY(productSlug));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSetup(productSlug: string, setup: SavedSetup) {
  localStorage.setItem(SETUP_SESSION_KEY(productSlug), JSON.stringify(setup));
}

function clearSetup(productSlug: string) {
  localStorage.removeItem(SETUP_SESSION_KEY(productSlug));
}

export function ProductStudyPage({ productSlug, productTitle, backRoute, backLabel, pageId }: ProductStudyPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isActualAdmin } = useAdmin();
  const [quizSize, setQuizSize] = useState<QuizSize | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[] | null>(null);
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null);

  const { data: studyBank = [], isLoading, error: bankError } = useQuestionBank({ productSlug, bankType: 'study' });
  const { progressByQuestion, recordAnswer } = useQuestionProgress(productSlug);

  /** Full mastery count + bar % (bar counts streak progress, not only completed mastery). */
  const studyBankMastery = useMemo(() => {
    let points = 0;
    let masteredInBank = 0;
    let withId = 0;
    for (const q of studyBank) {
      if (!q.id) continue;
      withId += 1;
      const row = progressByQuestion.get(q.id);
      const cc = row?.consecutive_correct ?? 0;
      points += Math.min(cc, QUESTION_MASTERY_STREAK);
      if (row?.mastered) masteredInBank += 1;
    }
    const maxPoints = withId * QUESTION_MASTERY_STREAK;
    const progressPercent = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;
    return { masteredInBank, progressPercent };
  }, [studyBank, progressByQuestion]);

  if (bankError) {
    return (
      <PageLayout title={`${productTitle} Study Bank | FINternship`} description="Error loading study questions">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive">Failed to load study questions</p>
            <p className="text-sm text-muted-foreground mt-2">{bankError instanceof Error ? bankError.message : 'Unknown error'}</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Restore session from localStorage on mount (only once, when questions load)
  useEffect(() => {
    if (activeQuestions) return; // Already have active questions, don't restore
    if (studyBank.length === 0) return; // Study bank not loaded yet

    const saved = loadSetup(productSlug);
    if (!saved) return; // No saved session

    // Verify the saved question texts still match (in case question bank changed)
    const restored = saved.questionTexts
      .map(text => studyBank.find(q => q.question === text))
      .filter((q): q is QuizQuestion => q !== undefined);

    if (restored.length === saved.questionTexts.length) {
      // All saved questions still exist, restore them
      setQuizSize(saved.quizSize);
      setCategoryFilter(saved.categoryFilter);
      setSelectedMode(saved.selectedMode);
      setActiveQuestions(restored);
    }
  }, [productSlug, studyBank]);

  const weakQuestions = useMemo(() => loadWeakQuestions(productSlug), [productSlug]);
  const weakCount = Object.keys(weakQuestions).length;

  const { freshPool, reviewPool, allPool } = useMemo(() => {
    const fresh = studyBank.filter(q => !q.id || !progressByQuestion.has(q.id));
    const review = studyBank.filter(q => q.id && progressByQuestion.has(q.id) && !progressByQuestion.get(q.id)!.mastered);
    return { freshPool: fresh, reviewPool: review, allPool: studyBank };
  }, [studyBank, progressByQuestion]);

  // Category counts based on selected mode pool (not full study bank)
  const categoryCounts = useMemo(() => {
    const modePool =
      selectedMode === 'fresh' ? freshPool :
      selectedMode === 'review' ? reviewPool :
      allPool;
    const counts: Record<string, number> = {};
    for (const q of modePool) {
      counts[q.category] = (counts[q.category] || 0) + 1;
    }
    return counts;
  }, [studyBank, selectedMode, freshPool, reviewPool, allPool]);

  const sessionPreview = useMemo(() => {
    if (!selectedMode) return null;
    const modePool =
      selectedMode === 'fresh' ? freshPool :
      selectedMode === 'review' ? reviewPool :
      allPool;
    const filtered =
      categoryFilter === 'all' ? modePool : modePool.filter((q) => q.category === categoryFilter);
    return {
      modePool,
      filtered,
      quizPresets: uniqueQuizPresets(filtered.length),
    };
  }, [selectedMode, categoryFilter, freshPool, reviewPool, allPool]);

  useEffect(() => {
    if (!sessionPreview || sessionPreview.filtered.length === 0) return;
    if (sessionPreview.quizPresets.length === 1) {
      setQuizSize(sessionPreview.quizPresets[0].preset);
    }
  }, [sessionPreview]);

  // Honour ?mode= query param from the QuestionBanks landing page deep-links.
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'fresh' || urlMode === 'review' || urlMode === 'all') {
      setSelectedMode(urlMode);
    }
  }, [searchParams]);

  const startQuiz = (size: QuizSize, category: CategoryFilter, mode: StudyMode) => {
    const modePool =
      mode === 'fresh' ? freshPool :
      mode === 'review' ? reviewPool :
      allPool;
    const pool = category === 'all' ? modePool : modePool.filter((q) => q.category === category);
    if (pool.length === 0) return; // Safety: no questions available
    const weak = pool.filter((q) => weakQuestions[q.question]);
    const strong = pool.filter((q) => !weakQuestions[q.question]);
    const shuffled = [...shuffleArray(weak), ...shuffleArray(strong)];
    const selected = shuffled.slice(0, Math.min(size, shuffled.length));
    if (selected.length === 0) return; // Safety: no questions selected
    setQuizSize(size);
    setCategoryFilter(category);
    setSelectedMode(mode);
    setActiveQuestions(selected);
    // Save setup for session restore on refresh
    saveSetup(productSlug, {
      quizSize: size,
      categoryFilter: category,
      selectedMode: mode,
      questionTexts: selected.map(q => q.question),
    });
  };

  const handleRestart = () => {
    setActiveQuestions(null);
    setQuizSize(null);
    // Keep selectedMode (and honour ?mode= via the effect) so "Back to Study Menu"
    // does not leave the question-count dropdown stuck disabled.
    clearSetup(productSlug);
  };

  const handleFinish = () => {
    clearSetup(productSlug);
    handleRestart();
  };

  if (isLoading) {
    return (
      <PageLayout title={`${productTitle} Study Bank | FINternship`} description="Loading study questions...">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (activeQuestions) {
    return (
      <ProtectedPage pageId={pageId}>
        <PageLayout
          title={`${productTitle} Study Mode | FINternship`}
          description={`Study ${productTitle} product knowledge with instant feedback.`}
        >
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <Button variant="ghost" size="sm" onClick={handleRestart} className="mb-3 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Study Menu
            </Button>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{activeQuestions.length} Questions</Badge>
                  <Badge variant="secondary">{categoryLabels[categoryFilter]}</Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shuffle className="h-3 w-3" /> Randomized
                  </Badge>
                </div>
                <StudyQuiz
                  questions={activeQuestions}
                  onFinish={handleFinish}
                  productSlug={productSlug}
                  onAnswered={recordAnswer}
                  masteryMastered={studyBankMastery.masteredInBank}
                  masteryTotal={studyBank.length}
                  masteryProgressPercent={studyBankMastery.progressPercent}
                />
              </div>
              <div className="w-full lg:w-64 shrink-0">
                <div className="lg:sticky lg:top-20">
                  <StudyResourcesSidebar productSlug={productSlug} />
                </div>
              </div>
            </div>
          </div>
        </PageLayout>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage pageId={pageId}>
      <PageLayout
        title={`${productTitle} Study Bank | FINternship`}
        description={`Study ${productTitle} product knowledge with practice questions.`}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <Button variant="ghost" size="sm" onClick={() => navigate(backRoute)} className="-ml-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {backLabel}
                </Button>
                {isActualAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin?tab=question-bank&product=${productSlug}&bank=study`)}
                  >
                    <Pencil className="h-4 w-4 mr-1.5" />
                    Edit questions
                  </Button>
                )}
              </div>

              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{productTitle} — Study Bank</h1>
                <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                  Low-pressure practice for advisors-in-training. {studyBank.length} questions with instant feedback—
                  separate from the scored exam, so you can learn without pressure.
                </p>
              </div>

              {weakCount > 0 && (
                <div className="rounded-lg border border-amber-200/80 bg-amber-50/90 dark:border-amber-900 dark:bg-amber-950/30 p-3 sm:p-4 mb-5 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-950 dark:text-amber-100">We’ll prioritise tricky topics</p>
                    <p className="text-xs text-amber-800/90 dark:text-amber-200/90 mt-1 leading-relaxed">
                      {weakCount} question{weakCount !== 1 ? 's' : ''} from earlier sessions will be mixed in first so you can reinforce them.
                    </p>
                  </div>
                </div>
              )}

              <div
                className="rounded-lg border bg-card p-4 shadow-sm mb-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Your Mastery</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Cloud className="h-3 w-3" aria-hidden />
                    <span>Auto-saved</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                    <span className="tabular-nums text-muted-foreground">
                      {studyBankMastery.masteredInBank} / {studyBank.length} mastered
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {studyBankMastery.progressPercent}%
                  </span>
                </div>
                <Progress value={studyBankMastery.progressPercent} className="h-2 mb-3" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mastery is {QUESTION_MASTERY_STREAK} correct in a row per question. The bar fills with partial credit (one correct ≈ halfway for that question).
                </p>
              </div>

              {freshPool && freshPool.length === 0 && !selectedMode && (
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/25 p-4 mb-5 flex gap-3">
                  <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-950 dark:text-emerald-100">
                    <p className="font-medium">You’ve seen every question at least once</p>
                    <p className="text-xs opacity-90 mt-1 leading-relaxed">
                      Use <strong className="font-medium">Review</strong> to focus on questions you haven’t mastered yet, or <strong className="font-medium">Redo all</strong> for a full mix.
                    </p>
                  </div>
                </div>
              )}

              <Card className="shadow-sm border-border/80">
                <CardHeader className="pb-3 px-4 pt-4 sm:px-5 sm:pt-5">
                  <CardTitle className="text-base font-semibold">Start studying</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Pick a mode, category, and number of questions, then hit Start.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <Label htmlFor="study-mode" className="text-xs text-muted-foreground">
                        Mode
                      </Label>
                      <select
                        id="study-mode"
                        value={selectedMode ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSelectedMode(v === '' ? null : (v as StudyMode));
                          if (v === '') setQuizSize(null);
                        }}
                        className="w-full rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select a learning mode</option>
                        <option value="fresh" disabled={freshPool.length === 0}>
                          Fresh — unseen ({freshPool.length})
                        </option>
                        <option value="review" disabled={reviewPool.length === 0}>
                          Review — needs work ({reviewPool.length})
                        </option>
                        <option value="all">Redo all — full bank ({allPool.length})</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <Label htmlFor="study-category" className="text-xs text-muted-foreground">
                        Category
                      </Label>
                      <select
                        id="study-category"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
                        className="w-full rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {(['all', 'product-facts', 'sales-angles', 'objection-handling', 'roleplay'] as const).map((cat) => {
                          const count =
                            cat === 'all'
                              ? sessionPreview
                                ? sessionPreview.modePool.length
                                : allPool.length
                              : (categoryCounts[cat] || 0);
                          return (
                            <option key={cat} value={cat}>
                              {categoryLabels[cat]} ({count})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <Label htmlFor="study-session-size" className="text-xs text-muted-foreground">
                        This round
                      </Label>
                      <select
                        id="study-session-size"
                        value={quizSize ?? ''}
                        onChange={(e) =>
                          setQuizSize(e.target.value ? (Number(e.target.value) as QuizSize) : null)
                        }
                        disabled={
                          !selectedMode ||
                          !sessionPreview ||
                          sessionPreview.filtered.length === 0
                        }
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {!selectedMode || !sessionPreview || sessionPreview.filtered.length === 0 ? (
                          <option value="">
                            {!selectedMode ? 'No. of questions' : 'No questions for this mix'}
                          </option>
                        ) : (
                          <>
                            <option value="">No. of questions</option>
                            {sessionPreview.quizPresets.map(({ preset, actual }) => (
                              <option key={preset} value={preset}>
                                {actual === sessionPreview.filtered.length
                                  ? `All ${actual} question${actual === 1 ? '' : 's'}`
                                  : `${actual} questions`}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                    <Button
                      className="min-h-[44px] w-full lg:w-auto lg:shrink-0 px-6"
                      onClick={() => {
                        if (selectedMode && quizSize) {
                          startQuiz(quizSize, categoryFilter, selectedMode);
                        }
                      }}
                      disabled={
                        !selectedMode ||
                        !quizSize ||
                        !sessionPreview ||
                        sessionPreview.filtered.length === 0
                      }
                    >
                      Start
                    </Button>
                  </div>

                  {selectedMode && sessionPreview && sessionPreview.filtered.length === 0 && (
                    <div className="rounded-md border border-amber-200/80 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30 px-3 py-2 flex gap-2 items-start text-xs text-amber-950 dark:text-amber-100">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        No questions for this mode and category. Try <strong className="font-medium">All categories</strong> or another mode.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6 rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 to-transparent p-4 sm:p-5">
                <p className="text-sm font-semibold">Ready for the real thing?</p>
                <p className="text-xs text-muted-foreground mt-1.5 mb-4 max-w-lg leading-relaxed">
                  When you’re comfortable with practice, the exam records your score on your profile—same product, more formal.
                </p>
                <Button variant="default" size="sm" className="gap-2" onClick={() => navigate(`/product/${productSlug}/exam`)}>
                  Go to exam
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
