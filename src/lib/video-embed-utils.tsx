/**
 * Video embed detection and conversion utilities
 */

export interface VideoEmbedInfo {
  isVideo: boolean;
  embedUrl?: string;
  platform?: 'youtube' | 'vimeo' | 'loom' | 'mp4';
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

  // Direct MP4/video file URLs
  const mp4Regex = /\.mp4(\?|$|#)/i;
  if (mp4Regex.test(url)) {
    return {
      isVideo: true,
      embedUrl: url,
      platform: 'mp4'
    };
  }

  return { isVideo: false };
}

interface VideoEmbedProps {
  embedUrl: string;
  platform: string;
}

export function VideoEmbed({ embedUrl, platform }: VideoEmbedProps) {
  if (platform === 'mp4') {
    return (
      <div className="my-4">
        <div className="relative w-full bg-black rounded-lg overflow-hidden border border-border shadow-sm" style={{ paddingBottom: '56.25%' }}>
          <video
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            controls
            controlsList="nodownload"
            preload="metadata"
            playsInline
          />
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="relative w-full bg-black aspect-video">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg border border-border shadow-sm"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          // @ts-ignore — legacy attributes for Safari/Firefox fullscreen
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          style={{ border: 0 }}
          title={`${platform} video`}
        />
      </div>
    </div>
  );
}
