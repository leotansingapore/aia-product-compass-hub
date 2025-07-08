export interface VideoEmbedInfo {
  embedUrl: string;
  type: 'youtube' | 'vimeo' | 'loom' | 'wistia';
  thumbnail?: string | null;
}

// Function to get video embed URL and type
export function getVideoEmbedInfo(url: string): VideoEmbedInfo | null {
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