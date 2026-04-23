import { useEffect, useState } from 'react';
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
import { moduleIdToProductId } from '@/data/cmfasModuleData';

// CMFAS lesson products — the 5 modules map to these product IDs. Used to
// surface the Action Steps editor only for CMFAS lessons, per plan scope.
const CMFAS_PRODUCT_IDS = new Set<string>(Object.values(moduleIdToProductId));

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

  // Get unique categories from existing videos
  const existingCategories = Array.from(
    new Set(
      (product?.training_videos || [])
        .map(v => v.category)
        .filter(Boolean)
    )
  );

  const videoManagement = useVideoManagement({
    initialVideos: product?.training_videos || [],
    onSave: handleVideoSave
  });

  // Auto-select the first lesson on load so admins land in the editor with
  // real content rather than the "Select a page from the sidebar" empty
  // state. Only runs once per product (productId change resets the hook).
  const autoSelectedRef = useState({ done: false })[0];
  useEffect(() => {
    if (autoSelectedRef.done) return;
    if (videoManagement.editingIndex !== null) return;
    if (videoManagement.editVideos.length === 0) return;
    videoManagement.setEditingIndex(0);
    autoSelectedRef.done = true;
  }, [videoManagement.editVideos.length, videoManagement.editingIndex, videoManagement.setEditingIndex, autoSelectedRef]);

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
          <div className="max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex-shrink-0 min-h-[44px] px-2 sm:px-3"
                >
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <div className="flex items-center gap-2 min-w-0">
                  <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate">
                      {product.title}
                    </h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">
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
              hasContentChanges={videoManagement.hasContentChanges}
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
              showActionSteps={product ? CMFAS_PRODUCT_IDS.has(product.id) : false}
            />
          </ErrorBoundary>
        </div>
      </div>
    </ProtectedAdminPage>
  );
}
