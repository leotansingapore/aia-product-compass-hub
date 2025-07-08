import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProductById, getCategoryIdFromName } from "@/hooks/useProducts";
import { useProductUpdate } from "@/hooks/useProductUpdate";
import { EditableTags } from "@/components/EditableTags";
import { ProductHeader } from "@/components/product-detail/ProductHeader";
import { ProductSummary } from "@/components/product-detail/ProductSummary";
import { ProductHighlights } from "@/components/product-detail/ProductHighlights";
import { ProductUsefulLinks } from "@/components/product-detail/ProductUsefulLinks";
import { ProductAIAssistant } from "@/components/product-detail/ProductAIAssistant";
import { ProductTrainingVideos } from "@/components/product-detail/ProductTrainingVideos";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { product, loading } = useProductById(productId || '');
  const { updateProduct } = useProductUpdate();

  const handleUpdate = async (field: string, value: any) => {
    if (!product) return;
    
    console.log('🎯 ProductDetail handleUpdate called:', { field, value, productId: product.id });
    
    try {
      await updateProduct(product.id, field, value);
      console.log('✅ ProductDetail update successful');
      
      // Force a refresh by calling the product fetch again
      window.location.reload();
    } catch (error) {
      console.error('❌ ProductDetail update failed:', error);
    }
  };

  const handleBack = () => {
    const categoryId = getCategoryIdFromName((product as any).categories?.name || '');
    navigate(`/category/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ProductHeader
          productTitle="Loading..."
          categoryName="Fetching product details..."
          onBack={() => window.history.back()}
        />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-background">
      <ProductHeader
        productTitle={product.title}
        categoryName={(product as any).categories?.name || ''}
        onBack={handleBack}
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Tags */}
        <div className="space-y-2">
          <EditableTags
            tags={product.tags || []}
            onSave={(newTags) => handleUpdate('tags', newTags)}
          />
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

      </div>
    </div>
  );
}