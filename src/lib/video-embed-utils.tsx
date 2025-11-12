/**
 * Video embed detection and conversion utilities
 */

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
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      isVideo: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
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
 * Video embed component for markdown rendering
 */
interface VideoEmbedProps {
  embedUrl: string;
  platform: string;
}

export function VideoEmbed({ embedUrl, platform }: VideoEmbedProps) {
  return (
    <div className="my-4">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg border border-border shadow-sm"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`${platform} video`}
        />
      </div>
    </div>
  );
}
