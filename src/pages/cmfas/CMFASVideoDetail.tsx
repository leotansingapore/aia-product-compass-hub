import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { VideoLearningInterface } from "@/components/video-learning/VideoLearningInterface";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { getVideoSlug, isVideoId } from "@/utils/slugUtils";
import { getCMFASModuleName, isCMFASModule } from "@/data/cmfasModuleData";
import { useCMFASModuleVideos } from "@/hooks/useCMFASModuleVideos";

export default function CMFASVideoDetail() {
  const { moduleId, videoSlugOrId } = useParams<{
    moduleId: string;
    videoSlugOrId: string;
  }>();
  const navigate = useNavigate();

  // ✅ ALL HOOKS MUST BE CALLED AT THE TOP (before any returns)
  // Validate module and provide fallback to avoid conditional hook calls
  const isValidModule = moduleId && isCMFASModule(moduleId);
  const safeModuleId = isValidModule ? moduleId : 'onboarding'; // Fallback for hook

  // Load videos from database (with static fallback)
  const { videos, loading } = useCMFASModuleVideos(safeModuleId);
  const moduleName = getCMFASModuleName(safeModuleId);

  // Handle backward compatibility - redirect old ID-based URLs to slug-based URLs
  // ✅ useEffect called at top level with safety guards inside
  useEffect(() => {
    if (!isValidModule || !videos.length || !videoSlugOrId) return;

    if (isVideoId(videoSlugOrId)) {
      const video = videos.find(v => v.id === videoSlugOrId);
      if (video) {
        const videoSlug = getVideoSlug(video.title);
        navigate(`/cmfas/module/${moduleId}/video/${videoSlug}`, { replace: true });
      }
    }
  }, [videos, videoSlugOrId, moduleId, navigate, isValidModule]);

  // ✅ NOW it's safe to do conditional returns (after all hooks are called)

  // Validate module exists
  if (!isValidModule) {
    return (
      <PageLayout
        title="Module Not Found | FINternship"
        description="The requested CMFAS module could not be found."
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Module Not Found</h1>
            <Button onClick={() => navigate('/cmfas-exams')}>
              Return to CMFAS Exams
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show loading state while fetching videos
  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  if (!videoSlugOrId) {
    return (
      <PageLayout
        title="Video Not Found | FINternship"
        description="The requested video could not be found."
      >
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
            <Button onClick={() => navigate(`/cmfas/module/${moduleId}`)}>
              Return to Module
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

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
            <Button onClick={() => navigate(`/cmfas/module/${moduleId}`)}>
              Return to Module
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <ProtectedPage pageId="cmfas-exams">
      <PageLayout
        title={`${currentVideo.title} - ${moduleName} | FINternship`}
        description={`Watch "${currentVideo.title}" - ${currentVideo.description || 'Training video'} from the ${moduleName} course.`}
      >
        <VideoLearningInterface
          videos={videos}
          productId={moduleId!}
          moduleId={moduleId!}
          moduleType="cmfas"
          initialVideoIndex={videoIndex}
          onClose={() => navigate(`/cmfas/module/${moduleId}`)}
        />
      </PageLayout>
    </ProtectedPage>
  );
}
