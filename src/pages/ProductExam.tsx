import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductQuiz } from '@/components/ProductQuiz';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedPage } from '@/components/ProtectedPage';
import { proAchieverExamQuestions } from '@/data/proAchieverExamQuestions';
import { platinumWealthVentureExamQuestions } from '@/data/platinumWealthVentureExamQuestions';
import { healthshieldGoldMaxExamQuestions } from '@/data/healthshieldGoldMaxExamQuestions';
import { proLifetimeProtectorExamQuestions } from '@/data/proLifetimeProtectorExamQuestions';
import { solitairePaExamQuestions } from '@/data/solitairePaExamQuestions';
import { ultimateCriticalCoverExamQuestions } from '@/data/ultimateCriticalCoverExamQuestions';
import { ArrowLeft, Brain, Target, Shield } from 'lucide-react';

const examRegistry: Record<string, { title: string; productId: string; questions: typeof proAchieverExamQuestions }> = {
  'pro-achiever': {
    title: 'Pro Achiever',
    productId: 'pro-achiever',
    questions: proAchieverExamQuestions,
  },
  'platinum-wealth-venture': {
    title: 'Platinum Wealth Venture',
    productId: 'platinum-wealth-venture',
    questions: platinumWealthVentureExamQuestions,
  },
  'healthshield-gold-max': {
    title: 'HealthShield Gold Max',
    productId: 'healthshield-gold-max',
    questions: healthshieldGoldMaxExamQuestions,
  },
  'pro-lifetime-protector': {
    title: 'Pro Lifetime Protector',
    productId: 'pro-lifetime-protector',
    questions: proLifetimeProtectorExamQuestions,
  },
  'solitaire-pa': {
    title: 'Solitaire PA',
    productId: 'solitaire-pa',
    questions: solitairePaExamQuestions,
  },
  'ultimate-critical-cover': {
    title: 'Ultimate Critical Cover',
    productId: 'ultimate-critical-cover',
    questions: ultimateCriticalCoverExamQuestions,
  },
};

export default function ProductExam() {
  const { productSlugOrId } = useParams();
  const navigate = useNavigate();

  const exam = examRegistry[productSlugOrId || ''];

  if (!exam) {
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

  const factCount = exam.questions.filter(q => q.category === 'product-facts').length;
  const salesCount = exam.questions.filter(q => q.category === 'sales-angles').length;
  const objectionCount = exam.questions.filter(q => q.category === 'objection-handling').length;
  const roleplayCount = exam.questions.filter(q => q.category === 'roleplay').length;

  return (
    <ProtectedPage pageId="product-exam">
      <PageLayout
        title={`${exam.title} Exam | FINternship`}
        description={`Test your knowledge of ${exam.title} — product facts, sales angles, and objection handling.`}
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/product/${productSlugOrId}`)}
              className="mb-3 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to {exam.title}
            </Button>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {exam.title} — Product Exam
            </h1>
            <p className="text-muted-foreground mb-4">
              Test your knowledge on product facts, sales angles, and objection handling.
              Your score will be recorded and visible to admins.
            </p>

            {/* Category breakdown badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                {factCount} Product Facts
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {salesCount} Sales Angles
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {objectionCount} Objection Handling
              </Badge>
            </div>
          </div>

          {/* Quiz */}
          <ProductQuiz questions={exam.questions} productId={exam.productId} />
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
