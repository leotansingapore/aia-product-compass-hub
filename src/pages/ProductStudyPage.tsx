import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { StudyQuiz, loadWeakQuestions } from '@/components/study/StudyQuiz';
import { ArrowLeft, BookOpen, Brain, Target, Shield, MessageCircle, Shuffle, AlertTriangle, Loader2 } from 'lucide-react';
import { StudyResourcesSidebar } from '@/components/study/StudyResourcesSidebar';
import type { QuizQuestion } from '@/types/questionBank';
import { useQuestionProgress } from '@/hooks/useQuestionProgress';
import { StudyModePicker, type StudyMode } from '@/components/study/StudyModePicker';
import { MasteryProgressBar } from '@/components/study/MasteryProgressBar';

type QuizSize = 25 | 50 | 100;
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

export function ProductStudyPage({ productSlug, productTitle, backRoute, backLabel, pageId }: ProductStudyPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [quizSize, setQuizSize] = useState<QuizSize | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[] | null>(null);
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null);

  const { data: studyBank = [], isLoading } = useQuestionBank({ productSlug, bankType: 'study' });
  const { progressByQuestion, masteredCount, recordAnswer } = useQuestionProgress(productSlug);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of studyBank) {
      counts[q.category] = (counts[q.category] || 0) + 1;
    }
    return counts;
  }, [studyBank]);

  const weakQuestions = useMemo(() => loadWeakQuestions(productSlug), [productSlug]);
  const weakCount = Object.keys(weakQuestions).length;

  const { freshPool, reviewPool, allPool } = useMemo(() => {
    const fresh = studyBank.filter(q => !q.id || !progressByQuestion.has(q.id));
    const review = studyBank.filter(q => q.id && progressByQuestion.has(q.id) && !progressByQuestion.get(q.id)!.mastered);
    return { freshPool: fresh, reviewPool: review, allPool: studyBank };
  }, [studyBank, progressByQuestion]);

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
    const weak = pool.filter((q) => weakQuestions[q.question]);
    const strong = pool.filter((q) => !weakQuestions[q.question]);
    const shuffled = [...shuffleArray(weak), ...shuffleArray(strong)];
    const selected = shuffled.slice(0, Math.min(size, shuffled.length));
    setQuizSize(size);
    setCategoryFilter(category);
    setActiveQuestions(selected);
  };

  const handleRestart = () => {
    setActiveQuestions(null);
    setQuizSize(null);
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
                  onFinish={handleRestart}
                  productSlug={productSlug}
                  onAnswered={recordAnswer}
                  masteryMastered={masteredCount}
                  masteryTotal={studyBank.length}
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
              <Button variant="ghost" size="sm" onClick={() => navigate(backRoute)} className="mb-3 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {backLabel}
              </Button>

              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{productTitle} — Study Bank</h1>
              <p className="text-muted-foreground mb-6">
                {studyBank.length} practice questions to prepare you for the actual exam. Questions are randomized
                each time. Instant explanations for every answer.
              </p>

              {weakCount > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 p-3 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>{weakCount} weak question{weakCount !== 1 ? 's' : ''}</strong> detected from past sessions. These will appear first in your next study set.
                  </p>
                </div>
              )}

              <div className="rounded-lg border bg-card p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Your Mastery</p>
                </div>
                <MasteryProgressBar mastered={masteredCount} total={studyBank.length} />
              </div>

              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Choose a learning mode</CardTitle>
                  <CardDescription className="text-xs">
                    Fresh = unseen questions. Review = attempted but not mastered. Redo All = everything.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudyModePicker
                    freshCount={freshPool.length}
                    reviewCount={reviewPool.length}
                    totalCount={allPool.length}
                    selectedMode={selectedMode}
                    onPick={setSelectedMode}
                  />
                </CardContent>
              </Card>


              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Filter by Category</CardTitle>
                  <CardDescription className="text-xs">Choose a specific area to focus on, or study all categories.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {(['all', 'product-facts', 'sales-angles', 'objection-handling', 'roleplay'] as const).map((cat) => {
                      const Icon = categoryIcons[cat];
                      const count = cat === 'all' ? studyBank.length : (categoryCounts[cat] || 0);
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors shrink-0 min-h-[44px] sm:min-h-0 ${
                            categoryFilter === cat
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-accent active:bg-accent/70'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="whitespace-nowrap">{categoryLabels[cat]}</span>
                          <span className="text-xs opacity-70">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Start Studying</CardTitle>
                  <CardDescription className="text-xs">
                    Pick how many questions you want. They'll be randomly selected from
                    {categoryFilter === 'all' ? ' the full bank' : ` ${categoryLabels[categoryFilter]}`}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const modePool =
                      selectedMode === 'fresh' ? freshPool :
                      selectedMode === 'review' ? reviewPool :
                      allPool;
                    const filtered = categoryFilter === 'all' ? modePool : modePool.filter(q => q.category === categoryFilter);
                    return (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={quizSize ?? ''}
                          onChange={(e) => setQuizSize(e.target.value ? Number(e.target.value) as QuizSize : null)}
                          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-ring"
                          disabled={!selectedMode || filtered.length === 0}
                        >
                          <option value="">Select number of questions</option>
                          {([25, 50, 100] as QuizSize[]).map((size) => {
                            const actualSize = Math.min(size, filtered.length);
                            return (
                              <option key={size} value={size}>
                                {actualSize} Questions
                              </option>
                            );
                          })}
                        </select>
                        <Button
                          className="min-h-[44px]"
                          onClick={() => selectedMode && quizSize && startQuiz(quizSize, categoryFilter, selectedMode)}
                          disabled={!selectedMode || !quizSize || filtered.length === 0}
                        >
                          {!selectedMode ? 'Select a mode first' : 'Start'}
                        </Button>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium mb-2">Ready for the real thing?</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Once you're confident, take the scored exam that's recorded on your profile.
                </p>
                <Button size="sm" onClick={() => navigate(`/product/${productSlug}/exam`)}>
                  Take the Actual Exam
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-64 shrink-0 order-first lg:order-last">
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
