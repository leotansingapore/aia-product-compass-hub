import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useProductById, getCategoryIdFromName } from "@/hooks/useProducts";
import { useProductUpdate } from "@/hooks/useProductUpdate";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useGamification } from "@/hooks/useGamification";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EditableTags } from "@/components/EditableTags";
import { ProductHeader } from "@/components/product-detail/ProductHeader";
import { ProductSummary } from "@/components/product-detail/ProductSummary";
import { ProductHighlights } from "@/components/product-detail/ProductHighlights";
import { ProductUsefulLinks } from "@/components/product-detail/ProductUsefulLinks";
import { ProductAIAssistant } from "@/components/product-detail/ProductAIAssistant";
import { ProductTrainingVideos } from "@/components/product-detail/ProductTrainingVideos";
import { BookmarkButton } from "@/components/BookmarkButton";
import { PersonalNotes } from "@/components/PersonalNotes";
import { ProductQuiz } from "@/components/ProductQuiz";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { ProtectedSection } from "@/components/ProtectedSection";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { product, loading } = useProductById(productId || '');
  const { updateProduct } = useProductUpdate();
  const { addToRecent } = useRecentlyViewed();
  const { recordPageVisit } = useGamification();
  const [showQuiz, setShowQuiz] = useState(false);

  // Sample quiz questions - in a real app, these would come from the database
  const sampleQuizQuestions = [
    {
      question: "What is the main benefit of this product?",
      options: ["Low cost", "High returns", "Flexibility", "Guaranteed protection"],
      correct: 3,
      explanation: "This product provides guaranteed protection as its main benefit, offering peace of mind to policyholders."
    },
    {
      question: "Who is the target audience for this product?",
      options: ["Young professionals", "Families", "Retirees", "All age groups"],
      correct: 1,
      explanation: "This product is designed primarily for families who need comprehensive protection and savings solutions."
    },
    {
      question: "What makes this product unique in the market?",
      options: ["Lowest premium", "Highest coverage", "Flexible features", "Quick approval"],
      correct: 2,
      explanation: "The flexible features of this product allow customers to adapt their coverage to changing life circumstances."
    }
  ];

  // Track product view and award XP - only run once per product
  useEffect(() => {
    if (product) {
      addToRecent(product.id, 'product');
      // Award XP for visiting the product page
      recordPageVisit(product.category_id, product.id);
    }
  }, [product?.id, addToRecent, recordPageVisit]);

  const handleUpdate = async (field: string, value: any) => {
    if (!product) return;
    
    console.log('🎯 ProductDetail handleUpdate called:', { field, value, productId: product.id });
    
    try {
      const updatedData = await updateProduct(product.id, field, value);
      console.log('✅ ProductDetail update successful:', updatedData);
      
      // Force a page refresh to show the updated data
      window.location.reload();
    } catch (error) {
      console.error('❌ ProductDetail update failed:', error);
    }
  };

  const handleBack = () => {
    // Navigate back to the category page
    if (product) {
      navigate(`/category/${product.category_id}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Enhanced breadcrumbs
  const categoryName = (product as any).categories?.name || '';
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: categoryName, href: `/category/${product.category_id}` },
    { label: product.title }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product?.title || 'Product Details'} - AIA Product Compass Hub</title>
        <meta name="description" content={`Learn about ${product?.title || 'this product'} - ${product?.description || 'Complete product information including benefits, features, training videos, and AI assistance for financial advisors.'}`} />
      </Helmet>
      <ProductHeader
        productTitle={product.title}
        categoryName={categoryName}
        onBack={handleBack}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
        
        {/* Tags and Bookmark Button */}
        <ProtectedSection sectionId="product_tags">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <EditableTags
                tags={product.tags || []}
                onSave={(newTags) => handleUpdate('tags', newTags)}
              />
            </div>
            <BookmarkButton productId={product.id} />
          </div>
        </ProtectedSection>

        {/* Summary */}
        <ProductSummary
          description={product.description || ''}
          onUpdate={handleUpdate}
        />

        {/* Key Highlights */}
        <ProductHighlights
          highlights={product.highlights || []}
          onUpdate={handleUpdate}
        />

        {/* Useful Links */}
        <ProductUsefulLinks
          links={product.useful_links || []}
          onUpdate={handleUpdate}
        />

        {/* AI Assistant */}
        <ProtectedSection sectionId="product_ai">
          <ProductAIAssistant 
            customGptLink={product.custom_gpt_link}
            onUpdate={handleUpdate}
          />
        </ProtectedSection>

        {/* Training Videos */}
        <ProtectedSection sectionId="product_videos">
          <ProductTrainingVideos
            videos={product.training_videos || []}
            productId={product.id}
            onUpdate={handleUpdate}
          />
        </ProtectedSection>

        {/* Quiz Section */}
        <ProtectedSection sectionId="product_quiz">
          <Card className="border-accent/20 bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Product Knowledge Quiz
                </CardTitle>
                <Button 
                  onClick={() => setShowQuiz(!showQuiz)}
                  variant={showQuiz ? "secondary" : "default"}
                >
                  {showQuiz ? "Hide Quiz" : "Take Quiz"}
                </Button>
              </div>
            </CardHeader>
            {showQuiz && (
              <CardContent>
                <ProductQuiz 
                  questions={sampleQuizQuestions}
                  productId={product.id}
                />
              </CardContent>
            )}
          </Card>
        </ProtectedSection>

        {/* Personal Notes */}
        <ProtectedSection sectionId="product_notes">
          <PersonalNotes productId={product.id} />
        </ProtectedSection>

      </div>
    </div>
  );
}