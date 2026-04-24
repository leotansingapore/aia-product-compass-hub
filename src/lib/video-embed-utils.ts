/**
 * Video embed detection and conversion utilities.
 *
 * Pure TypeScript — no React, no JSX. Split out of the old .tsx file so that
 * importing `detectVideoEmbed` from the markdown-render hot path doesn't drag
 * the iframe React component (and its transitive deps) into every day-page
 * chunk. The iframe component lives in `@/lib/video-embed`.
 */

export interface VideoEmbedInfo {
  isVideo: boolean;
  embedUrl?: string;
  platform?: 'youtube' | 'vimeo' | 'loom' | 'mp4';
}

export function detectVideoEmbed(url: string): VideoEmbedInfo {
  if (!url) return { isVideo: false };

  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      isVideo: true,
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      platform: 'youtube',
    };
  }

  const vimeoRegex = /vimeo\.com\/(?:manage\/videos\/|video\/)?(\d+)(?:\/([a-f0-9]+))?/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    const hash = vimeoMatch[2] ? `?h=${vimeoMatch[2]}` : '';
    return {
      isVideo: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}${hash}`,
      platform: 'vimeo',
    };
  }

  const loomRegex = /loom\.com\/share\/([a-zA-Z0-9]+)/;
  const loomMatch = url.match(loomRegex);
  if (loomMatch) {
    return {
      isVideo: true,
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      platform: 'loom',
    };
  }

  const mp4Regex = /\.mp4(\?|$|#)/i;
  if (mp4Regex.test(url)) {
    return {
      isVideo: true,
      embedUrl: url,
      platform: 'mp4',
    };
  }

  return { isVideo: false };
}

/**
 * True when two URLs resolve to the same playable video. Used to avoid
 * rendering duplicate players in hero + markdown.
 */
export function areSameVideoEmbedSource(urlA: string, urlB: string): boolean {
  const a = detectVideoEmbed(urlA.trim());
  const b = detectVideoEmbed(urlB.trim());
  if (!a.isVideo || !a.embedUrl || !b.isVideo || !b.embedUrl) return false;
  if (a.platform !== b.platform) return false;

  if (a.platform === 'mp4') {
    const strip = (u: string) => u.trim().split('?')[0].split('#')[0].toLowerCase();
    return strip(urlA) === strip(urlB);
  }

  try {
    const ua = new URL(a.embedUrl);
    const ub = new URL(b.embedUrl);
    if (a.platform === 'youtube') {
      return ua.pathname.replace(/\/$/, '') === ub.pathname.replace(/\/$/, '');
    }
    if (a.platform === 'vimeo') {
      return `${ua.pathname}${ua.search}` === `${ub.pathname}${ub.search}`;
    }
    if (a.platform === 'loom') {
      return ua.pathname.replace(/\/$/, '') === ub.pathname.replace(/\/$/, '');
    }
  } catch {
    return a.embedUrl.split('?')[0] === b.embedUrl.split('?')[0];
  }
  return false;
}

