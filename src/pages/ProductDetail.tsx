import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { product, loading } = useProductById(productId || '');
  const { updateProduct } = useProductUpdate();
  const { addToRecent } = useRecentlyViewed();
  const { recordPageVisit } = useGamification();

  // Track product view and award XP
  useEffect(() => {
    if (product) {
      addToRecent(product.id, 'product');
      // Award XP for visiting the product page
      recordPageVisit(product.category_id, product.id);
    }
  }, [product, addToRecent, recordPageVisit]);

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
    // Use browser history to go back to the actual previous page
    window.history.back();
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
      <ProductHeader
        productTitle={product.title}
        categoryName={categoryName}
        onBack={handleBack}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
        
        {/* Tags and Bookmark Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <EditableTags
              tags={product.tags || []}
              onSave={(newTags) => handleUpdate('tags', newTags)}
            />
          </div>
          <BookmarkButton productId={product.id} />
        </div>

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
        <ProductAIAssistant 
          customGptLink={product.custom_gpt_link}
          onUpdate={handleUpdate}
        />

        {/* Training Videos */}
        <ProductTrainingVideos
          videos={product.training_videos || []}
          productId={product.id}
          onUpdate={handleUpdate}
        />

        {/* Personal Notes */}
        <PersonalNotes productId={product.id} />

      </div>
    </div>
  );
}