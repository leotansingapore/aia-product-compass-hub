import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { StudyQuiz } from '@/components/study/StudyQuiz';
import { SimulationQuiz } from '@/components/study/SimulationQuiz';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useQuestionProgress } from '@/hooks/useQuestionProgress';
import { PRODUCT_LABELS, type QuizQuestion } from '@/types/questionBank';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getSimSession, clearSimSession, upsertReviewItem } from '@/lib/questionBankStore';

/**
 * Exam "Practice" mode. Runs the same instant-feedback StudyQuiz the study page
 * uses — so it shuffles options (no memorising answer position), records
 * per-question mastery, AND drops missed questions into the Review Bank —
 * instead of the old ProductQuiz, which did none of those and silently made
 * practice effort invisible.
 */
function ExamPracticeQuiz({
  questions,
  productSlug,
  onFinish,
}: {
  questions: QuizQuestion[];
  productSlug: string;
  onFinish: () => void;
}) {
  const { recordAnswer } = useQuestionProgress(productSlug);
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  return (
    <StudyQuiz
      questions={questions}
      productSlug={productSlug}
      // Exam bank — keeps this run's saved session separate from the study
      // bank's, which shares the same product slug.
      bankType="exam"
      onFinish={onFinish}
      onAnswered={(qid, correct) => {
        recordAnswer(qid, correct);
        if (!correct) {
          const q = byId.get(qid);
          if (q?.id) {
            upsertReviewItem({
              questionId: q.id,
              productSlug,
              bankType: 'exam',
              category: q.category,
              question: q.question,
              options: q.options,
              correctAnswer: q.correct,
              explanation: q.explanation,
              status: 'wrong',
              dateISO: new Date().toISOString(),
            });
          }
        }
      }}
    />
  );
}
import { ArrowLeft, Brain, Target, Shield, Loader2, Clock, Timer, GraduationCap, BookOpen } from 'lucide-react';

const PASS_MARK = 70;

export default function ProductExam() {
  const { productSlugOrId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const cameFromQuestionBank = location.state?.from === 'question-banks';
  const [mode, setMode] = useState<'intro' | 'simulation' | 'practice'>('intro');
  // Remount key for the simulation — see onRetake below.
  const [attemptKey, setAttemptKey] = useState(0);

  const productSlug = productSlugOrId || '';
  const title = PRODUCT_LABELS[productSlug];
  const { data: questions, isLoading, error } = useQuestionBank({
    productSlug,
    bankType: 'exam',
    enabled: !!title,
  });

  // If the learner refreshed / crashed out of a live paper, drop straight back
  // into it instead of the intro so the timer keeps running and no answers are
  // lost. Only resumes a session that matches the current question set.
  useEffect(() => {
    if (mode !== 'intro' || !questions || questions.length === 0) return;
    const saved = getSimSession(productSlug);
    if (!saved) return;
    const sig = questions.map((q) => q.id ?? q.question).join('|');
    if (saved.signature === sig) setMode('simulation');
    else clearSimSession(productSlug); // stale question set — discard
  }, [mode, questions, productSlug]);

  if (!title) {
    return (
      <PageLayout title="Exam Not Found | FINternship" description="No exam available for this product.">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Exam Not Found</h1>
            <p className="text-muted-foreground mb-4">No exam is available for this product yet.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout title={`${title} Exam | FINternship`} description="Loading exam questions...">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <PageLayout title={`${title} Exam | FINternship`} description="Exam unavailable">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Exam Unavailable</h1>
            <p className="text-muted-foreground mb-4">
              {error ? 'Failed to load exam questions.' : 'No questions have been added to this exam yet.'}
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const factCount = questions.filter((q) => q.category === 'product-facts').length;
  const salesCount = questions.filter((q) => q.category === 'sales-angles').length;
  const objectionCount = questions.filter((q) => q.category === 'objection-handling').length;
  const durationMin = Math.max(10, questions.length);

  // supabase-js resolves with `{ error }` rather than throwing, so the old
  // try/catch here never fired: a null `user_id` (token rotation) was rejected
  // by RLS while the learner was still shown a full PASS card. Check the
  // result, and tell them if the score didn't reach the server — but never
  // hide the result itself, they still sat the paper.
  const recordAttempt = async (result: { score: number; correct: number; total: number }) => {
    const warn = (detail: string) =>
      toast.warning("Your score wasn't saved to your record", {
        description: `${detail} Your result below is still correct — take a screenshot if you need it.`,
      });

    if (!user?.id) {
      console.error('Exam attempt not recorded: no signed-in user');
      warn('You appear to be signed out.');
      return;
    }

    const { error } = await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      product_id: productSlug,
      score: result.correct,
      total_questions: result.total,
      xp_earned: 0,
    });

    if (error) {
      console.error('Failed to record exam attempt:', error);
      warn('The server rejected the write.');
    }
  };

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(cameFromQuestionBank ? '/question-banks' : `/product/${productSlug}`)}
      className="mb-3 -ml-2 min-h-[44px] sm:min-h-0"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      {cameFromQuestionBank ? 'Back to Question Banks' : `Back to ${title}`}
    </Button>
  );

  return (
    <ProtectedPage pageId="product-exam">
      <PageLayout
        title={`${title} Exam | FINternship`}
        description={`Test your knowledge of ${title} — product facts, sales angles, and objection handling.`}
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
          {mode === 'intro' && (
            <>
              {backButton}
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title} — Product Exam</h1>
              <p className="text-muted-foreground mb-4">
                {questions.length} questions across product facts, sales angles, and objection handling.
                Choose how you want to take it.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="flex items-center gap-1"><Brain className="h-3 w-3" />{factCount} Product Facts</Badge>
                <Badge variant="secondary" className="flex items-center gap-1"><Target className="h-3 w-3" />{salesCount} Sales Angles</Badge>
                <Badge variant="secondary" className="flex items-center gap-1"><Shield className="h-3 w-3" />{objectionCount} Objection Handling</Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border-primary/30 hover:border-primary/60 transition-colors">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Timer className="h-5 w-5 text-primary" />
                      <h2 className="font-semibold">Simulation</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 flex-1">
                      Exam conditions: a {durationMin}-minute timer, answers hidden until you submit, and a {PASS_MARK}% pass mark.
                      Your score is recorded and missed questions go to your Review Bank.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                      <li className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {durationMin} min · {questions.length} questions</li>
                      <li className="flex items-center gap-1.5"><GraduationCap className="h-3 w-3" /> Pass mark {PASS_MARK}%</li>
                    </ul>
                    <Button className="w-full" onClick={() => setMode('simulation')}>Start simulation</Button>
                  </CardContent>
                </Card>

                <Card className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <h2 className="font-semibold">Practice</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 flex-1">
                      No timer. Get instant feedback and a teaching explanation after every question — best for
                      learning the material before you sit the simulation.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                      <li className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> Untimed · instant feedback</li>
                    </ul>
                    <Button variant="outline" className="w-full" onClick={() => setMode('practice')}>Practice instead</Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {mode === 'simulation' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Exit the simulation? Your answers this round will be lost.')) {
                    clearSimSession(productSlug);
                    setMode('intro');
                  }
                }}
                className="mb-3 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" /> Exit simulation
              </Button>
              <SimulationQuiz
                // Bumping this key mounts a genuinely fresh paper. A page
                // reload used to be the "retake" — it dropped the query cache
                // and dumped the learner back on the intro picker instead.
                key={attemptKey}
                questions={questions}
                productSlug={productSlug}
                productTitle={title}
                passMark={PASS_MARK}
                durationSec={durationMin * 60}
                onExit={() => navigate(cameFromQuestionBank ? '/question-banks' : `/product/${productSlug}`)}
                onRetake={() => {
                  clearSimSession(productSlug);
                  setAttemptKey((k) => k + 1);
                }}
                onComplete={recordAttempt}
              />
            </>
          )}

          {mode === 'practice' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setMode('intro')} className="mb-3 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to options
              </Button>
              <ExamPracticeQuiz questions={questions} productSlug={productSlug} onFinish={() => setMode('intro')} />
            </>
          )}
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
