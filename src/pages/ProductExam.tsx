import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductQuiz } from '@/components/ProductQuiz';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { PRODUCT_LABELS } from '@/types/questionBank';
import { ArrowLeft, Brain, Target, Shield, Loader2 } from 'lucide-react';

export default function ProductExam() {
  const { productSlugOrId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cameFromQuestionBank = location.state?.from === 'question-banks';

  const productSlug = productSlugOrId || '';
  const title = PRODUCT_LABELS[productSlug];
  const { data: questions, isLoading, error } = useQuestionBank({
    productSlug,
    bankType: 'exam',
    enabled: !!title,
  });

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

  return (
    <ProtectedPage pageId="product-exam">
      <PageLayout
        title={`${title} Exam | FINternship`}
        description={`Test your knowledge of ${title} — product facts, sales angles, and objection handling.`}
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(cameFromQuestionBank ? '/question-banks' : `/product/${productSlug}`)}
              className="mb-3 -ml-2 min-h-[44px] sm:min-h-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {cameFromQuestionBank ? 'Back to Question Banks' : `Back to ${title}`}
            </Button>

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {title} — Product Exam
            </h1>
            <p className="text-muted-foreground mb-4">
              Test your knowledge on product facts, sales angles, and objection handling.
              Your score will be recorded and visible to admins.
            </p>

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

          <ProductQuiz questions={questions} productId={productSlug} />
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
