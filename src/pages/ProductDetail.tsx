import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { EditableTags } from "@/components/EditableTags";
import { ProductHeader } from "@/components/product-detail/ProductHeader";
import { ProductSummary } from "@/components/product-detail/ProductSummary";
import { ProductHighlights } from "@/components/product-detail/ProductHighlights";
import { ProductUsefulLinks } from "@/components/product-detail/ProductUsefulLinks";
import { SalesToolsUsefulLinks } from "@/components/product-detail/SalesToolsUsefulLinks";
import { ProductChatbots } from "@/components/product-detail/ProductChatbots";
import { ProductTrainingVideos } from "@/components/product-detail/ProductTrainingVideos";
import { VideoEditingInterface } from "@/components/video-editing/VideoEditingInterface";
import { useVideoManagement } from "@/hooks/useVideoManagement";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BookmarkButton } from "@/components/BookmarkButton";
import { PersonalNotes } from "@/components/PersonalNotes";
import { ProtectedSection } from "@/components/ProtectedSection";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageLayout } from "@/components/layout/PageLayout";
import { useProductDetail } from "@/hooks/useProductDetail";
import { usePermissions } from "@/hooks/usePermissions";
import { Edit } from "lucide-react";
import type { TrainingVideo } from "@/hooks/useProducts";
import { getVideoSlug } from "@/utils/slugUtils";

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
  const { isAdmin } = usePermissions();
  const isAdminMode = isAdmin();
  const [isChatEditing, setIsChatEditing] = useState(false);

  const [editingIndexFromUrl, setEditingIndexFromUrl] = useState<number | null>(null);

  // Video management setup for admins - must be declared before using editVideos
  const handleVideoSave = async (updatedVideos: TrainingVideo[]) => {
    await handleUpdate('training_videos', updatedVideos);
  };

  const videoManagement = useVideoManagement({
    initialVideos: product?.training_videos || [],
    onSave: handleVideoSave
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
          onBack={handleBack}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-8 md:pb-10 animate-fade-in">

          {/* 2-Column Grid Layout - Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 overflow-hidden mb-8">

            {/* Left Column - Main Content */}
            <div className="md:col-span-1 lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">

              {/* Bookmark Button */}
              <div className="flex justify-end">
                <BookmarkButton productId={product.id} />
              </div>

              {/* Chat Assistance Section */}
              <ProtectedSection sectionId="product_chat_assistance">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Chat Assistance</h2>
                    {isAdminMode && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsChatEditing(true)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit All Chats
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProductChatbots
                      chatbot1Name={product.chatbot_1_name}
                      chatbot1Link={product.custom_gpt_link}
                      chatbot2Name={product.chatbot_2_name}
                      chatbot3Name={product.chatbot_3_name}
                      chatbot2Link={product.chatbot_link_2}
                      chatbot3Link={product.chatbot_link_3}
                      buttonText={product.chatbot_button_text}
                      onUpdate={handleUpdate}
                      isEditing={isChatEditing}
                      setIsEditing={setIsChatEditing}
                    />
                  </div>
                </div>
              </ProtectedSection>

            </div>

            {/* Right Column - Sidebar */}
            <div className="md:col-span-1 lg:col-span-1 space-y-4 sm:space-y-6 md:space-y-8">

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

              {/* Personal Notes */}
              <ProtectedSection sectionId="product_notes">
                <PersonalNotes productId={product.id} />
              </ProtectedSection>

            </div>

          </div>

          {/* Training Videos Section */}
          <ProtectedSection sectionId="product_videos">
            <div className="border-t pt-8">
              {isAdminMode ? (
                <ErrorBoundary>
                  <VideoEditingInterface
                    editVideos={videoManagement.editVideos}
                    editingIndex={editingIndexFromUrl ?? videoManagement.editingIndex}
                    newVideo={videoManagement.newVideo}
                    saving={videoManagement.saving}
                    existingCategories={existingCategories}
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

        </div>
      </PageLayout>
    </ProtectedPage>
  );
}