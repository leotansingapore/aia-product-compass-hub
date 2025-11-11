import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProductDetail } from '@/hooks/useProductDetail';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { ProtectedAdminPage } from '@/components/ProtectedAdminPage';
import { VideoEditingInterface } from '@/components/video-editing/VideoEditingInterface';
import { useVideoManagement } from '@/hooks/useVideoManagement';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { TrainingVideo } from '@/hooks/useProducts';

export default function ManageProductVideos() {
  const { productSlugOrId } = useParams();
  const navigate = useNavigate();
  const { product, loading, handleUpdate } = useProductDetail();

  const handleVideoSave = async (updatedVideos: TrainingVideo[]) => {
    await handleUpdate('training_videos', updatedVideos);
  };

  const handleBack = () => {
    navigate(`/product/${productSlugOrId}`);
  };

  const videoManagement = useVideoManagement({
    initialVideos: product?.training_videos || [],
    onSave: handleVideoSave
  });

  // Get unique categories from existing videos
  const existingCategories = Array.from(
    new Set(
      (product?.training_videos || [])
        .map(v => v.category)
        .filter(Boolean)
    )
  );

  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  if (!product) {
    return (
      <ProtectedAdminPage>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Product Not Found</h2>
            <Button onClick={() => navigate('/admin')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedAdminPage>
    );
  }

  return (
    <ProtectedAdminPage>
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Manage Videos - {product.title} - FINternship</title>
          <meta name="description" content={`Edit and organize training videos for ${product.title}`} />
        </Helmet>

        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">
                      {product.title}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Course Management
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - SKOOL-style Layout */}
        <div className="max-w-[1600px] mx-auto">
          <ErrorBoundary>
            <VideoEditingInterface
              editVideos={videoManagement.editVideos}
              editingIndex={videoManagement.editingIndex}
              newVideo={videoManagement.newVideo}
              saving={videoManagement.saving}
              existingCategories={existingCategories}
              onEditingIndexChange={videoManagement.setEditingIndex}
              onUpdateVideo={videoManagement.updateVideo}
              onSetEditVideos={videoManagement.setEditVideos}
              onRemoveVideo={videoManagement.removeVideo}
              onMoveVideo={videoManagement.moveVideo}
              onNewVideoChange={videoManagement.setNewVideo}
              onAddVideo={videoManagement.addVideo}
              onSave={videoManagement.handleSave}
              onCancel={handleBack}
              onCreateCategory={videoManagement.addEmptyFolder}
            />
          </ErrorBoundary>
        </div>
      </div>
    </ProtectedAdminPage>
  );
}
