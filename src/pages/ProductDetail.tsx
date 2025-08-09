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
import { SalesToolsUsefulLinks } from "@/components/product-detail/SalesToolsUsefulLinks";
import { ProductAIAssistant } from "@/components/product-detail/ProductAIAssistant";
import { ProductChatLauncher } from "@/components/product-detail/ProductChatLauncher";
import { ProductTrainingVideos } from "@/components/product-detail/ProductTrainingVideos";
import { BookmarkButton } from "@/components/BookmarkButton";
import { PersonalNotes } from "@/components/PersonalNotes";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { ProtectedSection } from "@/components/ProtectedSection";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { product, loading } = useProductById(productId || '');
  const { updateProduct } = useProductUpdate();
  const { addToRecent } = useRecentlyViewed();
  const { recordPageVisit } = useGamification();
  const [assistantOpen, setAssistantOpen] = useState(false);


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

  // Enhanced breadcrumbs - special handling for sales tools
  const categoryName = (product as any).categories?.name || '';
  const breadcrumbs = productId === 'sales-tools-objections' 
    ? [
        { label: 'Home', href: '/' },
        { label: 'Resources', href: '/' },
        { label: product.title }
      ]
    : [
        { label: 'Home', href: '/' },
        { label: categoryName, href: `/category/${product.category_id}` },
        { label: product.title }
      ];

  return (
    <ProtectedPage pageId="product-detail">
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product?.title || 'Product Details'} - FINternship Learning Platform</title>
        <meta name="description" content={`Learn about ${product?.title || 'this product'} - ${product?.description || 'Complete product information including benefits, features, training videos, and AI assistance for financial advisors.'}`} />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>
      <ProductHeader
        productTitle={product.title}
        categoryName={categoryName}
        onBack={handleBack}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="max-w-4xl mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 pb-24 md:pb-8 space-y-3 sm:space-y-6 md:space-y-8 animate-fade-in">
        
        {/* Tags and Bookmark Button */}
        <ProtectedSection sectionId="product_tags">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <EditableTags
                tags={product.tags || []}
                onSave={(newTags) => handleUpdate('tags', newTags)}
              />
            </div>
            <div className="self-end sm:self-auto">
              <BookmarkButton productId={product.id} />
            </div>
          </div>
        </ProtectedSection>

        {/* Summary - Hidden for Sales Tools */}
        {productId !== 'sales-tools-objections' && (
          <ProductSummary
            description={product.description || ''}
            onUpdate={handleUpdate}
          />
        )}

        {/* Key Highlights - Hidden for Sales Tools */}
        {productId !== 'sales-tools-objections' && (
          <ProductHighlights
            highlights={product.highlights || []}
            onUpdate={handleUpdate}
          />
        )}

        {/* Useful Links */}
        {productId === 'sales-tools-objections' ? (
          <SalesToolsUsefulLinks
            links={product.useful_links || []}
            onUpdate={handleUpdate}
          />
        ) : (
          <ProductUsefulLinks
            links={product.useful_links || []}
            onUpdate={handleUpdate}
          />
        )}

        <ProductChatLauncher productName={product.title} onLaunch={() => setAssistantOpen(true)} />

        {/* AI Assistant - Collapsible */}
        <ProtectedSection sectionId="product_ai">
          <Card className="border-accent/20 bg-card/50">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>🤖</span> AI Assistant
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setAssistantOpen(!assistantOpen)}>
                  {assistantOpen ? 'Hide' : 'Open'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`${assistantOpen ? '' : 'hidden'}`}>
                <ProductAIAssistant 
                  customGptLink={product.custom_gpt_link}
                  productData={{
                    id: product.id,
                    name: product.title,
                    category: product.category_id,
                    summary: product.description,
                    highlights: product.highlights,
                    assistant_id: product.assistant_id,
                    assistant_instructions: product.assistant_instructions
                  }}
                  onUpdate={handleUpdate}
                />
              </div>
            </CardContent>
          </Card>
        </ProtectedSection>

        {/* Training Videos */}
        <ProtectedSection sectionId="product_videos">
          <ProductTrainingVideos
            videos={product.training_videos || []}
            productId={product.id}
            onUpdate={handleUpdate}
          />
        </ProtectedSection>


        {/* Personal Notes */}
        <ProtectedSection sectionId="product_notes">
          <PersonalNotes productId={product.id} />
        </ProtectedSection>

      </div>
    </div>
    </ProtectedPage>
  );
}