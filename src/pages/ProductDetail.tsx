import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { ProductHeader } from "@/components/product-detail/ProductHeader";
import { ProductUsefulLinks } from "@/components/product-detail/ProductUsefulLinks";
import { SalesToolsUsefulLinks } from "@/components/product-detail/SalesToolsUsefulLinks";
import { FloatingAIChat } from "@/components/product-detail/FloatingAIChat";
import { ProductSyncButton } from "@/components/product-detail/ProductSyncButton";
import { ProductTrainingVideos } from "@/components/product-detail/ProductTrainingVideos";
import { SubModulesSection } from "@/components/product-detail/SubModulesSection";
import { VideoEditingInterface } from "@/components/video-editing/VideoEditingInterface";
import { useVideoManagement } from "@/hooks/useVideoManagement";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BookmarkButton } from "@/components/BookmarkButton";
import { PersonalNotes } from "@/components/PersonalNotes";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedSection } from "@/components/ProtectedSection";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageLayout } from "@/components/layout/PageLayout";
import { useProductDetail } from "@/hooks/useProductDetail";
import { useAdmin } from "@/hooks/useAdmin";
import type { TrainingVideo } from "@/hooks/useProducts";
import { getVideoSlug } from "@/utils/slugUtils";
import { Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PRODUCTS_WITH_EXAMS = new Set(['pro-achiever']);

export default function ProductDetail() {
  const {
    product,
    loading,
    productId,
    handleUpdate,
    handleBack,
    breadcrumbs,
    categoryName
  } = useProductDetail();

  const { productSlugOrId, pageId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const isAdminMode = isAdmin;

  const [editingIndexFromUrl, setEditingIndexFromUrl] = useState<number | null>(null);

  // Video management setup for admins - auto-syncs to AI knowledge base after save
  const handleVideoSave = useCallback(async (updatedVideos: TrainingVideo[]) => {
    await handleUpdate('training_videos', updatedVideos);
    
    // Auto-sync to AI knowledge base (fire-and-forget, admin only)
    if (isAdminMode && product?.id) {
      toast({ title: "Syncing training videos to AI…" });
      supabase.functions.invoke("process-knowledge", {
        body: { action: "sync_training_videos", product_id: product.id },
      }).then(({ data, error }) => {
        if (error) throw error;
        toast({ title: "AI knowledge base updated ✓", description: `${data?.chunks_created ?? 0} chunks synced` });
      }).catch((e: any) => {
        console.error("Auto-sync to AI failed:", e);
        toast({ title: "AI sync failed", description: e.message, variant: "destructive" });
      });
    }
  }, [handleUpdate, isAdminMode, product?.id]);

  const videoManagement = useVideoManagement({
    initialVideos: product?.training_videos || [],
    onSave: handleVideoSave,
    productId: product?.id
  });


  const existingCategories = Array.from(
    new Set(
      (product?.training_videos || [])
        .map(v => v.category)
        .filter(Boolean)
    )
  );

  // Update URL when editing index changes in admin mode
  const handleEditingIndexChange = (index: number | null) => {
    const currentVideos = videoManagement.editVideos.length > 0 
      ? videoManagement.editVideos 
      : product?.training_videos || [];
      
    if (isAdminMode && currentVideos.length > 0) {
      if (index !== null && currentVideos[index]) {
        const video = currentVideos[index];
        const slug = getVideoSlug(video.title);
        navigate(`/product/${productSlugOrId}/${slug}`, { replace: true });
      } else {
        navigate(`/product/${productSlugOrId}`, { replace: true });
      }
    }
    setEditingIndexFromUrl(index);
  };

  // Initialize editing index from URL on mount or auto-select first video
  useEffect(() => {
    const currentVideos = videoManagement.editVideos.length > 0 
      ? videoManagement.editVideos 
      : product?.training_videos || [];
      
    if (currentVideos.length > 0 && isAdminMode) {
      if (pageId) {
        const index = currentVideos.findIndex(v => getVideoSlug(v.title) === pageId);
        if (index !== -1) {
          setEditingIndexFromUrl(index);
        }
      } else if (editingIndexFromUrl === null) {
        const firstVideo = currentVideos[0];
        const slug = getVideoSlug(firstVideo.title);
        navigate(`/product/${productSlugOrId}/${slug}`, { replace: true });
        setEditingIndexFromUrl(0);
      }
    }
  }, [videoManagement.editVideos, product?.training_videos, pageId, isAdminMode, productSlugOrId, navigate]);

  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  if (!product) {
    return (
      <PageLayout
        title="Product Not Found | FINternship"
        description="The requested product could not be found."
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={handleBack}>Return to Dashboard</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <ProtectedPage pageId="product-detail">
      <PageLayout
        title={`${product?.title || 'Product Details'} - FINternship Learning Platform`}
        description={`Learn about ${product?.title || 'this product'} - ${product?.description || 'Complete product information including benefits, features, training videos, and AI assistance for financial advisors.'}`}
      >
        <ProductHeader
          productTitle={product.title}
          categoryName={categoryName}
          description={product.description || ''}
          onBack={handleBack}
          breadcrumbs={breadcrumbs}
          onTitleEdit={isAdminMode ? (newTitle) => handleUpdate('title', newTitle) : undefined}
          onDescriptionEdit={isAdminMode ? (newDesc) => handleUpdate('description', newDesc) : undefined}
        />
        
        {/* Floating AI Assistant Chat - outside containing div to ensure fixed positioning works */}
        <FloatingAIChat
          productId={product.id}
          productName={product.title}
        />

        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 md:pb-10 animate-fade-in">

          {/* Compact Top Actions */}
          <div className="flex justify-end gap-2 mb-2 sm:mb-4">
            {isAdminMode && <ProductSyncButton productId={product.id} productName={product.title} />}
            <BookmarkButton productId={product.id} />
          </div>

          {/* Resources Section - full width on mobile */}
          <div className="mb-4 sm:mb-8">
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
                productId={productId}
              />
            )}
          </div>

          {/* Product Exam CTA */}
          {PRODUCTS_WITH_EXAMS.has(product.id) && (
            <Card className="mb-4 sm:mb-8 border-primary/20 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Product Knowledge Exam</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Test your knowledge on product facts, sales angles, and objection handling
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/product/${productSlugOrId}/exam`)}
                  className="shrink-0 w-full sm:w-auto"
                >
                  Take Exam
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Training Videos Section */}
          <ProtectedSection sectionId="product_videos">
            <div className="pt-4 sm:pt-8">
              {isAdminMode ? (
                <ErrorBoundary>
                  <VideoEditingInterface
                    editVideos={videoManagement.editVideos}
                    editingIndex={editingIndexFromUrl ?? videoManagement.editingIndex}
                    newVideo={videoManagement.newVideo}
                    saving={videoManagement.saving}
                    existingCategories={existingCategories}
                    hasContentChanges={videoManagement.hasContentChanges}
                    onEditingIndexChange={handleEditingIndexChange}
                    onUpdateVideo={videoManagement.updateVideo}
                    onSetEditVideos={videoManagement.setEditVideos}
                    onRemoveVideo={videoManagement.removeVideo}
                    onMoveVideo={videoManagement.moveVideo}
                    onNewVideoChange={videoManagement.setNewVideo}
                    onAddVideo={videoManagement.addVideo}
                    onSave={videoManagement.handleSave}
                    onCancel={() => videoManagement.handleCancel()}
                    onCreateCategory={videoManagement.addEmptyFolder}
                  />
                </ErrorBoundary>
              ) : (
                <ProductTrainingVideos
                  videos={product?.training_videos || []}
                  productId={product.id}
                  onUpdate={handleUpdate}
                />
              )}
            </div>
          </ProtectedSection>

          {/* Sub-modules Section */}
          <SubModulesSection parentProductId={product.id} />

          {/* Personal Notes — at the bottom */}
          <ProtectedSection sectionId="product_notes">
            <div className="mt-4 sm:mt-8">
              <PersonalNotes productId={product.id} />
            </div>
          </ProtectedSection>

        </div>
      </PageLayout>
    </ProtectedPage>
  );
}