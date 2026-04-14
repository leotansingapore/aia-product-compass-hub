import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedPage } from '@/components/ProtectedPage';
import { proAchieverStudyBank } from '@/data/proAchieverStudyBank';
import { StudyQuiz, loadWeakQuestions } from '@/components/study/StudyQuiz';
import { ArrowLeft, BookOpen, Brain, Target, Shield, MessageCircle, Shuffle, AlertTriangle } from 'lucide-react';
import { StudyResourcesSidebar } from '@/components/study/StudyResourcesSidebar';

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

export default function ProAchieverStudy() {
  const navigate = useNavigate();
  const [quizSize, setQuizSize] = useState<QuizSize | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [activeQuestions, setActiveQuestions] = useState<typeof proAchieverStudyBank | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of proAchieverStudyBank) {
      counts[q.category] = (counts[q.category] || 0) + 1;
    }
    return counts;
  }, []);

  const weakQuestions = useMemo(() => loadWeakQuestions('pro-achiever'), []);
  const weakCount = Object.keys(weakQuestions).length;

  const startQuiz = (size: QuizSize, category: CategoryFilter) => {
    let pool = category === 'all'
      ? proAchieverStudyBank
      : proAchieverStudyBank.filter(q => q.category === category);

    // Prioritize weak questions: put them first, then shuffle the rest
    const weak = pool.filter(q => weakQuestions[q.question]);
    const strong = pool.filter(q => !weakQuestions[q.question]);
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

  // Active quiz mode
  if (activeQuestions) {
    return (
      <ProtectedPage pageId="pro-achiever-study">
        <PageLayout
          title="Pro Achiever Study Mode | FINternship"
          description="Study Pro Achiever product knowledge with instant feedback."
        >
          <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestart}
              className="mb-3 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Study Menu
            </Button>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{activeQuestions.length} Questions</Badge>
              <Badge variant="secondary">{categoryLabels[categoryFilter]}</Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shuffle className="h-3 w-3" /> Randomized
              </Badge>
            </div>

            <StudyQuiz questions={activeQuestions} onFinish={handleRestart} productSlug="pro-achiever" />
          </div>
        </PageLayout>
      </ProtectedPage>
    );
  }

  // Selection screen
  return (
    <ProtectedPage pageId="pro-achiever-study">
      <PageLayout
        title="Pro Achiever Study Bank | FINternship"
        description="Study Pro Achiever product knowledge with 1000 practice questions."
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/product/pro-achiever/pro-achiever-overview')}
            className="mb-3 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Pro Achiever
          </Button>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Pro Achiever — Study Bank
          </h1>
          <p className="text-muted-foreground mb-6">
            {proAchieverStudyBank.length} practice questions to prepare you for the actual exam.
            Questions are randomized each time. Instant explanations for every answer.
          </p>

          {/* Weak questions indicator */}
          {weakCount > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 p-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>{weakCount} weak question{weakCount !== 1 ? 's' : ''}</strong> detected from past sessions. These will appear first in your next study set.
              </p>
            </div>
          )}

          {/* Category breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {(['product-facts', 'sales-angles', 'objection-handling', 'roleplay'] as const).map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <div key={cat} className="rounded-lg border bg-card p-3 text-center">
                  <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <div className="text-lg font-bold tabular-nums">{categoryCounts[cat] || 0}</div>
                  <div className="text-[11px] text-muted-foreground">{categoryLabels[cat]}</div>
                </div>
              );
            })}
          </div>

          {/* Category filter */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filter by Category</CardTitle>
              <CardDescription className="text-xs">Choose a specific area to focus on, or study all categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(['all', 'product-facts', 'sales-angles', 'objection-handling', 'roleplay'] as const).map((cat) => {
                  const Icon = categoryIcons[cat];
                  const count = cat === 'all' ? proAchieverStudyBank.length : (categoryCounts[cat] || 0);
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        categoryFilter === cat
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {categoryLabels[cat]}
                      <span className="text-xs opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quiz size selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Start Studying</CardTitle>
              <CardDescription className="text-xs">
                Pick how many questions you want. They'll be randomly selected from
                {categoryFilter === 'all' ? ' the full bank' : ` ${categoryLabels[categoryFilter]}`}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {([25, 50, 100] as QuizSize[]).map((size) => {
                  const available = categoryFilter === 'all'
                    ? proAchieverStudyBank.length
                    : (categoryCounts[categoryFilter] || 0);
                  const actualSize = Math.min(size, available);
                  return (
                    <Button
                      key={size}
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-1"
                      onClick={() => startQuiz(size, categoryFilter)}
                      disabled={available === 0}
                    >
                      <span className="text-xl font-bold">{actualSize}</span>
                      <span className="text-xs text-muted-foreground">Questions</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Link to actual exam */}
          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium mb-2">Ready for the real thing?</p>
            <p className="text-xs text-muted-foreground mb-3">
              Once you're confident, take the scored exam that's recorded on your profile.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/product/pro-achiever/exam')}
            >
              Take the Actual Exam
            </Button>
          </div>
          </div>
          <div className="w-full lg:w-64 shrink-0 order-first lg:order-last">
            <div className="lg:sticky lg:top-20">
              <StudyResourcesSidebar productSlug="pro-achiever" />
            </div>
          </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
