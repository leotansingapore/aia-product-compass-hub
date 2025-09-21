import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { VideoLearningInterface } from "@/components/video-learning/VideoLearningInterface";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useProductBySlugOrId } from "@/hooks/useProducts";

export default function VideoDetail() {
  const { productSlugOrId, videoId } = useParams<{
    productSlugOrId: string;
    videoId: string;
  }>();
  const navigate = useNavigate();
  
  const { product, loading } = useProductBySlugOrId(productSlugOrId || '');

  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  if (!product || !videoId) {
    return (
      <PageLayout
        title="Video Not Found | FINternship"
        description="The requested video could not be found."
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const videos = product.training_videos || [];
  const videoIndex = videos.findIndex(video => video.id === videoId);
  const currentVideo = videos[videoIndex];

  if (videoIndex === -1 || !currentVideo) {
    return (
      <PageLayout
        title="Video Not Found | FINternship"
        description="The requested video could not be found."
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
            <Button onClick={() => navigate(`/product/${productSlugOrId}`)}>
              Return to Product
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <ProtectedPage pageId="video-detail">
      <PageLayout
        title={`${currentVideo.title} - ${product.title} | FINternship`}
        description={`Watch "${currentVideo.title}" - ${currentVideo.description || 'Training video'} from the ${product.title} course.`}
      >
        <VideoLearningInterface
          videos={videos}
          productId={product.id}
          initialVideoIndex={videoIndex}
          onClose={() => navigate(`/product/${productSlugOrId}`)}
        />
      </PageLayout>
    </ProtectedPage>
  );
}