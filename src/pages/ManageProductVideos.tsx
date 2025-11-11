import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetail } from '@/hooks/useProductDetail';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { EditableVideos } from '@/components/EditableVideos';
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

  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  if (!product) {
    return (
      <AdminLayout
        title="Product Not Found"
        description="The requested product could not be found"
      >
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate('/admin')}>
            Return to Dashboard
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Manage Training Videos"
      description={`Edit and organize training videos for ${product.title}`}
      pageTitle={`Manage Videos - ${product.title} - FINternship`}
    >
      {/* Header with Back Button */}
      <div className="mb-6 space-y-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {product.title}
        </Button>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {product.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            Organize your course structure, add videos, and manage training content
          </p>
        </div>
      </div>

      {/* Video Editing Interface */}
      <ErrorBoundary>
        <EditableVideos
          videos={product.training_videos || []}
          onSave={handleVideoSave}
          onExitEditMode={handleBack}
        />
      </ErrorBoundary>
    </AdminLayout>
  );
}
