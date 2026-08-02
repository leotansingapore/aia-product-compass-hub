/**
 * Client-side guard for the "Change Avatar" picker.
 *
 * The UI promises "JPG, PNG or GIF (max 5MB)" but nothing enforced it: the
 * `accept="image/*"` attribute is a file-dialog filter, not a validation, and
 * is trivially bypassed by drag/drop or by picking "All files". A 40MB TIFF or
 * a .mov renamed to .png went straight into storage.
 *
 * This is a client-side check only - it improves the message the user sees, it
 * does not secure the bucket. Server-side enforcement (bucket-level size limit
 * and allowed mime types) is still required.
 */

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const AVATAR_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

const MIME_LABEL = 'JPG, PNG, GIF or WebP';

export interface AvatarFileLike {
  name: string;
  size: number;
  type: string;
}

/**
 * Returns a human-readable reason the file is unacceptable, or `null` when it
 * passes. The message names the actual problem so the user knows what to fix.
 */
export function validateAvatarFile(file: AvatarFileLike): string | null {
  const type = (file.type || '').toLowerCase();

  if (!type) {
    return `"${file.name}" has no recognisable image type. Choose a ${MIME_LABEL} image.`;
  }

  if (!(AVATAR_ALLOWED_MIME_TYPES as readonly string[]).includes(type)) {
    return `"${file.name}" is a ${type} file. Avatars must be ${MIME_LABEL}.`;
  }

  if (file.size <= 0) {
    return `"${file.name}" is empty.`;
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return `"${file.name}" is ${formatBytes(file.size)}. The limit is 5MB.`;
  }

  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }
  return `${bytes} bytes`;
}
