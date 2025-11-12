import { useState } from "react";
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
import { BookmarkButton } from "@/components/BookmarkButton";
import { PersonalNotes } from "@/components/PersonalNotes";
import { ProtectedSection } from "@/components/ProtectedSection";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageLayout } from "@/components/layout/PageLayout";
import { useProductDetail } from "@/hooks/useProductDetail";
import { usePermissions } from "@/hooks/usePermissions";
import { Edit } from "lucide-react";

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

  const { isAdmin } = usePermissions();
  const isAdminMode = isAdmin();
  const [isChatEditing, setIsChatEditing] = useState(false);

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 overflow-hidden mb-8">

            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">

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
            <div className="lg:col-span-1 space-y-4 sm:space-y-6 md:space-y-8">

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
              <ProductTrainingVideos
                videos={product?.training_videos || []}
                productId={product.id}
                onUpdate={handleUpdate}
              />
            </div>
          </ProtectedSection>

        </div>
      </PageLayout>
    </ProtectedPage>
  );
}