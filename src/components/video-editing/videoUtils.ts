export interface VideoEmbedInfo {
  embedUrl: string;
  type: 'youtube' | 'vimeo' | 'loom' | 'wistia';
  thumbnail?: string | null;
  duration?: number | null;
}

// Function to get video embed URL and type
export function getVideoEmbedInfo(url: string): VideoEmbedInfo | null {
  if (!url) return null;
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      type: 'youtube',
      thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      type: 'vimeo',
      thumbnail: null
    };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-f0-9]+)/);
  if (loomMatch) {
    return {
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      type: 'loom',
      thumbnail: null
    };
  }

  // Wistia
  const wistiaMatch = url.match(/wistia\.com\/medias\/([a-z0-9]+)/);
  if (wistiaMatch) {
    return {
      embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}`,
      type: 'wistia',
      thumbnail: null
    };
  }

  return null;
}

// Auto-detect video duration from various platforms
export async function fetchVideoDuration(url: string): Promise<number | null> {
  const videoInfo = getVideoEmbedInfo(url);
  if (!videoInfo) return null;

  try {
    switch (videoInfo.type) {
      case 'youtube':
        return await fetchYouTubeDuration(url);
      case 'vimeo':
        return await fetchVimeoDuration(url);
      case 'wistia':
        return await fetchWistiaDuration(url);
      case 'loom':
        // Loom doesn't provide public API for duration
        return null;
      default:
        return null;
    }
  } catch (error) {
    console.warn('Failed to fetch video duration:', error);
    return null;
  }
}

// Fetch YouTube video duration using oEmbed API
async function fetchYouTubeDuration(url: string): Promise<number | null> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (!response.ok) return null;
    
    // YouTube oEmbed doesn't provide duration, but we can try to get it from the video ID
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (!youtubeMatch) return null;
    
    // For now, return null since we don't have API key for YouTube Data API
    // In production, you'd use: https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${API_KEY}
    return null;
  } catch (error) {
    return null;
  }
}

// Fetch Vimeo video duration using oEmbed API
async function fetchVimeoDuration(url: string): Promise<number | null> {
  try {
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.duration || null;
  } catch (error) {
    return null;
  }
}

// Fetch Wistia video duration using oEmbed API
async function fetchWistiaDuration(url: string): Promise<number | null> {
  try {
    const response = await fetch(`https://fast.wistia.com/oembed?url=${encodeURIComponent(url)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.duration || null;
  } catch (error) {
    return null;
  }
}

// Format duration in seconds to human readable format (MM:SS)
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}