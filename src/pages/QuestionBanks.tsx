import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PageLayout } from '@/components/layout/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { PRODUCT_SLUGS, PRODUCT_LABELS } from '@/types/questionBank';
import { useStudyMasteryBySlug } from '@/hooks/useStudyMasteryBySlug';
import { useBankAttempts, useReviewBank } from '@/hooks/useQuestionBankStore';
import { bestExamScore } from '@/lib/questionBankStore';
import {
  BookOpen,
  Timer,
  Trophy,
  Brain,
  Library as LibraryIcon,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const PASS_MARK = 70;

const productDescriptions: Record<string, string> = {
  'pro-achiever': "Regular premium ILP — AIA's best-selling investment plan.",
  'platinum-wealth-venture': 'Limited premium ILP with wealth accumulation focus.',
  'healthshield-gold-max': 'Integrated Shield Plan for hospitalisation and surgical coverage.',
  'pro-lifetime-protector': 'Hybrid ILP combining lifetime protection with investment growth.',
  'solitaire-pa': 'Personal accident plan for outpatient and accident coverage.',
  'ultimate-critical-cover': 'Multi-pay critical illness plan with multi-claim cover.',
  'guaranteed-protect-plus': 'Whole-life par plan — accumulator + booster multipliers with optional CI riders.',
};

function useBankCounts() {
  return useQuery({
    queryKey: ['question-bank-counts'],
    queryFn: async (): Promise<Record<string, { study: number; exam: number }>> => {
      const { data, error } = await supabase
        .from('question_bank_questions' as never)
        .select('product_slug, bank_type')
        .range(0, 9999);
      if (error) throw error;
      const counts: Record<string, { study: number; exam: number }> = {};
      for (const row of (data ?? []) as Array<{ product_slug: string; bank_type: 'study' | 'exam' }>) {
        counts[row.product_slug] ??= { study: 0, exam: 0 };
        counts[row.product_slug][row.bank_type]++;
      }
      return counts;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function QuestionBanks() {
  const navigate = useNavigate();
  const { data: counts = {}, isLoading } = useBankCounts();
  const { data: mastery = {} } = useStudyMasteryBySlug();
  const attempts = useBankAttempts();
  const reviewBank = useReviewBank();

  const stats = useMemo(() => {
    const masteredTotal = Object.values(mastery).reduce((acc, m) => acc + (m?.mastered ?? 0), 0);
    const examReady = PRODUCT_SLUGS.filter((s) => (bestExamScore(s) ?? 0) >= PASS_MARK).length;
    const examScores = attempts.filter((a) => a.bankType === 'exam').map((a) => a.score);
    const avgExam = examScores.length ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length) : null;
    return { masteredTotal, examReady, avgExam, papers: attempts.length };
  }, [mastery, attempts]);

  const last = attempts[0] ?? null;
  const reviewByProduct = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of reviewBank) m[r.productSlug] = (m[r.productSlug] ?? 0) + 1;
    return m;
  }, [reviewBank]);

  const statCards = [
    { label: 'Products', value: PRODUCT_SLUGS.length, icon: LibraryIcon },
    { label: 'Questions mastered', value: stats.masteredTotal, icon: Brain },
    { label: 'Exam-ready', value: `${stats.examReady}/${PRODUCT_SLUGS.length}`, icon: GraduationCap },
    { label: 'Avg exam score', value: stats.avgExam === null ? '—' : `${stats.avgExam}%`, icon: Trophy },
  ];

  return (
    <PageLayout title="Question Banks | FINternship" description="Master every AIA product — study, simulate exams, and track your progress.">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Question Banks</h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Build product mastery and pitch confidence. Study with instant feedback, sit timed simulation exams,
              and drill the questions you miss.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5" onClick={() => navigate('/review-bank')}>
              <BookOpen className="h-4 w-4" /> Review Bank
              {reviewBank.length > 0 && <Badge variant="secondary" className="ml-1">{reviewBank.length}</Badge>}
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={() => navigate('/review-all')}>
              <LibraryIcon className="h-4 w-4" /> All Q&amp;A
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {statCards.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Last attempt snapshot */}
        {last && (
          <Card className="mb-5 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-4 flex items-center gap-4 flex-wrap">
              <div className={`h-12 w-12 rounded-full grid place-items-center shrink-0 ${last.passed ? 'bg-green-100 dark:bg-green-950' : 'bg-amber-100 dark:bg-amber-950'}`}>
                <span className={`text-sm font-bold ${last.passed ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                  {last.score}%
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  Last attempt · {PRODUCT_LABELS[last.productSlug] ?? last.productSlug}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {last.mode} · {last.correct}/{last.total} correct · {last.passed ? 'passed' : 'below pass mark'}
                </p>
              </div>
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => navigate(`/product/${last.productSlug}/exam`)}>
                Retake <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Per-product cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {PRODUCT_SLUGS.map((slug) => {
              const m = mastery[slug];
              const c = counts[slug] ?? { study: 0, exam: 0 };
              const best = bestExamScore(slug);
              const ready = (best ?? 0) >= PASS_MARK;
              const reviewN = reviewByProduct[slug] ?? 0;
              return (
                <Card key={slug} className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{PRODUCT_LABELS[slug]}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{productDescriptions[slug]}</p>
                      </div>
                      {best !== null && (
                        <Badge className={`shrink-0 text-[10px] gap-1 ${ready ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-muted text-muted-foreground'}`}>
                          {ready && <CheckCircle2 className="h-3 w-3" />}
                          Best {best}%
                        </Badge>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Study mastery</span>
                        <span className="tabular-nums">{m?.mastered ?? 0}/{c.study} · {m?.progressPercent ?? 0}%</span>
                      </div>
                      <Progress value={m?.progressPercent ?? 0} className="h-2" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="gap-1.5 flex-1" onClick={() => navigate(`/product/${slug}/study`)}>
                        <BookOpen className="h-3.5 w-3.5" /> Study ({c.study})
                      </Button>
                      <Button size="sm" className="gap-1.5 flex-1" onClick={() => navigate(`/product/${slug}/exam`, { state: { from: 'question-banks' } })}>
                        <Timer className="h-3.5 w-3.5" /> Exam ({c.exam})
                      </Button>
                    </div>
                    {reviewN > 0 && (
                      <button
                        onClick={() => navigate('/review-bank')}
                        className="mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        {reviewN} question{reviewN !== 1 ? 's' : ''} in your Review Bank
                      </button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
