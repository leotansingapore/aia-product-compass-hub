import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedPage } from '@/components/ProtectedPage';
import { BrandedPageHeader, BreadcrumbItem } from '@/components/layout/BrandedPageHeader';
import { ProductKnowledgeChat } from '@/components/product-detail/ProductKnowledgeChat';

export default function AIAssistant() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  // Fetch product data for context
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  const handleHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return <SkeletonLoader type="product" />;
  }

  if (!product) {
    return (
      <PageLayout
        title="AI Assistant Not Found | FINternship"
        description="The requested AI assistant could not be found."
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">AI Assistant Not Available</h1>
            <button onClick={handleHome} className="text-primary hover:underline">
              Return to Dashboard
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Breadcrumb navigation
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: product.title, href: `/product/${productId}` },
    { label: "AI Assistant" }
  ];

  return (
    <ProtectedPage pageId="ai-assistant">
      <PageLayout
        title={`AI Assistant - ${product.title} | FINternship`}
        description={`Chat with AI assistant about ${product.title}. Get instant answers about features, benefits, sales tips, and more.`}
        className="h-screen overflow-hidden bg-background"
      >
        <div className="flex flex-col h-full">
          <BrandedPageHeader
            title={`🤖 ${product.title} - AI Assistant`}
            subtitle="Get instant answers about features, benefits, and sales tips"
            breadcrumbs={breadcrumbs}
            className="flex-shrink-0"
          />

          {/* Full-Width AI Chat */}
          <div className="flex-1 min-h-0">
            <ProductKnowledgeChat
              productId={product.id}
              productName={product.title}
            />
          </div>
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
