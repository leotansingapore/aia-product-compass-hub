import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { VideoLearningInterface } from "@/components/video-learning/VideoLearningInterface";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useProductBySlugOrId } from "@/hooks/useProducts";
import { getVideoSlug, isVideoId } from "@/utils/slugUtils";

export default function VideoDetail() {
  const { productSlugOrId, videoId: videoSlugOrId } = useParams<{
    productSlugOrId: string;
    videoId: string;
  }>();
  const navigate = useNavigate();

  const { product, loading } = useProductBySlugOrId(productSlugOrId || '');

  // Handle backward compatibility - redirect old ID-based URLs to slug-based URLs
  useEffect(() => {
    if (product && videoSlugOrId && isVideoId(videoSlugOrId)) {
      const videos = product.training_videos || [];
      const video = videos.find(v => v.id === videoSlugOrId);
      if (video) {
        const videoSlug = getVideoSlug(video.title);
        navigate(`/product/${productSlugOrId}/video/${videoSlug}`, { replace: true });
      }
    }
  }, [product, videoSlugOrId, productSlugOrId, navigate]);

  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  if (!product || !videoSlugOrId) {
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

  // Find video by slug (matching against title) or by ID (backward compatibility)
  let videoIndex = videos.findIndex(video => getVideoSlug(video.title) === videoSlugOrId);

  // Fallback to ID-based lookup if slug doesn't match
  if (videoIndex === -1) {
    videoIndex = videos.findIndex(video => video.id === videoSlugOrId);
  }

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