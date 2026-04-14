import { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getVideoEmbedInfo } from './videoUtils';
import type { TrainingVideo } from '@/hooks/useProducts';

interface VideoDisplayProps {
  videos: TrainingVideo[];
  className?: string;
}

interface VideoItemProps {
  video: TrainingVideo;
}

function VideoItem({ video }: VideoItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoInfo = video?.url ? getVideoEmbedInfo(video.url) : null;

  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(document.fullscreenElement === containerRef.current);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (isFullscreen) {
      document.exitFullscreen().catch(console.error);
    } else {
      containerRef.current.requestFullscreen().catch(console.error);
    }
  }, [isFullscreen]);

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-lg">{video.title}</h4>
        {video.description && (
          <p className="text-muted-foreground text-sm">{video.description}</p>
        )}
      </div>
      {videoInfo ? (
        <div
          ref={containerRef}
          className="group relative aspect-video rounded-lg overflow-hidden bg-black"
          style={{ height: isFullscreen ? '100vh' : undefined }}
        >
          {videoInfo.type === 'mp4' ? (
            <video
              src={videoInfo.embedUrl}
              title={video.title}
              className="w-full h-full"
              controls
              preload="metadata"
            />
          ) : (
            <iframe
              src={videoInfo.embedUrl}
              title={video.title}
              className="w-full h-full"
              style={{ borderRadius: isFullscreen ? '0' : undefined }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 hover:bg-black/90 text-white border-0 h-9 w-9"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      ) : (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Invalid video URL</p>
        </div>
      )}
    </div>
  );
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
      {videos.map((video, index) => (
        <VideoItem key={index} video={video} />
      ))}
    </div>
  );
}