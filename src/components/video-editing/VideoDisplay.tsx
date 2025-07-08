import { getVideoEmbedInfo } from './videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoDisplayProps {
  videos: TrainingVideo[];
  className?: string;
}

export function VideoDisplay({ videos, className = "" }: VideoDisplayProps) {
  if (videos.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-muted-foreground">Training videos coming soon</p>
          <p className="text-sm text-muted-foreground mt-2">Loom-style explainer videos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {videos.map((video, index) => {
        const videoInfo = getVideoEmbedInfo(video.url);
        return (
          <div key={index} className="space-y-3">
            <div>
              <h4 className="font-medium text-lg">{video.title}</h4>
              {video.description && (
                <p className="text-muted-foreground text-sm">{video.description}</p>
              )}
            </div>
            {videoInfo ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={videoInfo.embedUrl}
                  title={video.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Invalid video URL</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}