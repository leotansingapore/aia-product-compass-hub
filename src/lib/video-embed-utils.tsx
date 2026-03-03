/**
 * Video embed detection and conversion utilities
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface VideoEmbedInfo {
  isVideo: boolean;
  embedUrl?: string;
  platform?: 'youtube' | 'vimeo' | 'loom';
}

/**
 * Detects if a URL is a video link and returns embed information
 */
export function detectVideoEmbed(url: string): VideoEmbedInfo {
  if (!url) return { isVideo: false };

  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      isVideo: true,
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      platform: 'youtube'
    };
  }

  // Vimeo patterns
  const vimeoRegex = /vimeo\.com\/(?:manage\/videos\/|video\/)?(\d+)(?:\/([a-f0-9]+))?/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    const hash = vimeoMatch[2] ? `?h=${vimeoMatch[2]}` : '';
    return {
      isVideo: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}${hash}`,
      platform: 'vimeo'
    };
  }

  // Loom patterns
  const loomRegex = /loom\.com\/share\/([a-zA-Z0-9]+)/;
  const loomMatch = url.match(loomRegex);
  if (loomMatch) {
    return {
      isVideo: true,
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      platform: 'loom'
    };
  }

  return { isVideo: false };
}

/**
 * Video embed component for markdown rendering with fullscreen support
 */
interface VideoEmbedProps {
  embedUrl: string;
  platform: string;
}

export function VideoEmbed({ embedUrl, platform }: VideoEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    <div className="my-4">
      <div 
        ref={containerRef}
        className="group relative w-full bg-black" 
        style={{ paddingBottom: isFullscreen ? '0' : '56.25%', height: isFullscreen ? '100vh' : 'auto' }}
      >
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg border border-border shadow-sm"
          style={{ borderRadius: isFullscreen ? '0' : undefined }}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`${platform} video`}
        />
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
    </div>
  );
}
