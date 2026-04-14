/**
 * URL helpers for learning-track content blocks. Centralises platform
 * detection so content-block creation, editing, and previews agree on
 * what counts as a "video" or "image" URL.
 */

const VIDEO_HOST_PATTERNS = [
  /(^|\.)youtube\.com$/i,
  /(^|\.)youtu\.be$/i,
  /(^|\.)vimeo\.com$/i,
  /(^|\.)loom\.com$/i,
  /(^|\.)wistia\.com$/i,
  /(^|\.)wistia\.net$/i,
];

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
const IMAGE_HOSTS = [
  /(^|\.)imgur\.com$/i,
  /(^|\.)unsplash\.com$/i,
  /(^|\.)cloudinary\.com$/i,
];

function parseHost(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/** True if the URL looks like a hosted video (YouTube, Vimeo, Loom, Wistia). */
export function isVideoUrl(url: string): boolean {
  const host = parseHost(url);
  if (!host) return false;
  return VIDEO_HOST_PATTERNS.some((re) => re.test(host));
}

/** True if the URL looks like an image resource. */
export function isImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (IMAGE_EXTENSIONS.some((ext) => lower.split("?")[0].endsWith(ext))) return true;
  const host = parseHost(url);
  if (!host) return false;
  return IMAGE_HOSTS.some((re) => re.test(host));
}
