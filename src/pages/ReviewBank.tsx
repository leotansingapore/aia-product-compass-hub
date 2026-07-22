import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedPage } from '@/components/ProtectedPage';
import { StudyQuiz } from '@/components/study/StudyQuiz';
import { useReviewBank } from '@/hooks/useQuestionBankStore';
import {
  removeReviewItem,
  recordReviewPractice,
  type ReviewItem,
  type ReviewStatus,
} from '@/lib/questionBankStore';
import { PRODUCT_LABELS, CATEGORY_LABELS, type QuizQuestion } from '@/types/questionBank';
import {
  ArrowLeft,
  BookmarkX,
  CheckCircle2,
  Dumbbell,
  Flag,
  HelpCircle,
  XCircle,
  Inbox,
} from 'lucide-react';

const STATUS_META: Record<ReviewStatus, { label: string; icon: React.ElementType; cls: string }> = {
  wrong: { label: 'Got wrong', icon: XCircle, cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  unsure: { label: 'Unsure', icon: HelpCircle, cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  flagged: { label: 'Flagged', icon: Flag, cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
};

function reviewItemToQuiz(item: ReviewItem): QuizQuestion {
  return {
    id: item.questionId,
    question: item.question,
    options: item.options,
    correct: item.correctAnswer,
    explanation: item.explanation,
    category: item.category as QuizQuestion['category'],
  };
}

export default function ReviewBank() {
  const navigate = useNavigate();
  const bank = useReviewBank();
  const [productFilter, setProductFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [practiceItems, setPracticeItems] = useState<ReviewItem[] | null>(null);

  const products = useMemo(() => {
    const set = new Set(bank.map((b) => b.productSlug));
    return Array.from(set);
  }, [bank]);

  const filtered = useMemo(
    () =>
      bank.filter(
        (b) =>
          (productFilter === 'all' || b.productSlug === productFilter) &&
          (statusFilter === 'all' || b.status === statusFilter),
      ),
    [bank, productFilter, statusFilter],
  );

  const statusCounts = useMemo(() => {
    const c = { wrong: 0, unsure: 0, flagged: 0 };
    for (const b of bank) c[b.status]++;
    return c;
  }, [bank]);

  // ── Practice session over the filtered review items ───────────────────────
  if (practiceItems) {
    const questions = practiceItems.map(reviewItemToQuiz);
    return (
      <ProtectedPage pageId="review-bank">
        <PageLayout title="Review Bank Practice | FINternship" description="Re-practice the questions you saved.">
          <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            <Button variant="ghost" size="sm" onClick={() => setPracticeItems(null)} className="mb-3 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Review Bank
            </Button>
            <div className="mb-4">
              <h1 className="text-xl font-bold">Review Bank Practice</h1>
              <p className="text-sm text-muted-foreground">
                {questions.length} saved question{questions.length !== 1 ? 's' : ''}. Answer one correctly twice in a
                row and it clears from your bank automatically.
              </p>
            </div>
            <StudyQuiz
              questions={questions}
              productSlug="review-bank"
              onFinish={() => setPracticeItems(null)}
              onAnswered={(qid, correct) => recordReviewPractice(qid, correct)}
            />
          </div>
        </PageLayout>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage pageId="review-bank">
      <PageLayout title="Review Bank | FINternship" description="Questions you got wrong, flagged, or were unsure about.">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
          <Button variant="ghost" size="sm" onClick={() => navigate('/question-banks')} className="mb-3 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Question Banks
          </Button>

          <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Review Bank</h1>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Every question you missed in a simulation lands here, plus anything you flag or mark unsure.
                Drill them until they stick.
              </p>
            </div>
            {filtered.length > 0 && (
              <Button onClick={() => setPracticeItems(filtered)} className="gap-1.5">
                <Dumbbell className="h-4 w-4" /> Practice {filtered.length}
              </Button>
            )}
          </div>

          {bank.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <Inbox className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Your Review Bank is empty</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Take a product Simulation exam — any questions you miss are saved here automatically so you can
                  master them before your next attempt.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate('/question-banks')}>
                  Go to Question Banks
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px] flex-1"
                >
                  <option value="all">All products ({bank.length})</option>
                  {products.map((slug) => (
                    <option key={slug} value={slug}>
                      {PRODUCT_LABELS[slug] ?? slug} ({bank.filter((b) => b.productSlug === slug).length})
                    </option>
                  ))}
                </select>
                <div className="flex gap-1.5 flex-wrap">
                  {(['all', 'wrong', 'unsure', 'flagged'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-2 rounded-md text-xs font-medium border min-h-[44px] transition-colors ${
                        statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
                      }`}
                    >
                      {s === 'all' ? `All (${bank.length})` : `${STATUS_META[s].label} (${statusCounts[s]})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="space-y-3">
                {filtered.map((item) => {
                  const meta = STATUS_META[item.status];
                  const StatusIcon = meta.icon;
                  return (
                    <Card key={item.questionId}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={`text-[10px] gap-1 ${meta.cls}`}>
                            <StatusIcon className="h-3 w-3" /> {meta.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{PRODUCT_LABELS[item.productSlug] ?? item.productSlug}</Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ?? item.category}
                          </Badge>
                          <button
                            onClick={() => removeReviewItem(item.questionId)}
                            className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove from Review Bank"
                            title="Remove from Review Bank"
                          >
                            <BookmarkX className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm font-medium mb-2">{item.question}</p>
                        <div className="space-y-1">
                          {item.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`text-xs rounded px-2 py-1 flex items-start gap-1.5 ${
                                i === item.correctAnswer
                                  ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 font-medium'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {i === item.correctAnswer ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              ) : (
                                <span className="h-3.5 w-3.5 shrink-0 mt-0.5 text-center">{String.fromCharCode(65 + i)}</span>
                              )}
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed border-t pt-2">{item.explanation}</p>
                      </CardContent>
                    </Card>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No questions match this filter.</p>
                )}
              </div>
            </>
          )}
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
