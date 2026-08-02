import { describe, it, expect } from 'vitest';
import {
  AVATAR_MAX_BYTES,
  formatBytes,
  validateAvatarFile,
} from './avatarUpload';

const file = (over: Partial<{ name: string; size: number; type: string }> = {}) => ({
  name: 'photo.png',
  size: 1024,
  type: 'image/png',
  ...over,
});

describe('validateAvatarFile', () => {
  it('accepts a small PNG', () => {
    expect(validateAvatarFile(file())).toBeNull();
  });

  it('accepts JPEG, GIF and WebP', () => {
    expect(validateAvatarFile(file({ type: 'image/jpeg' }))).toBeNull();
    expect(validateAvatarFile(file({ type: 'image/gif' }))).toBeNull();
    expect(validateAvatarFile(file({ type: 'image/webp' }))).toBeNull();
  });

  it('accepts an upper-cased mime type', () => {
    expect(validateAvatarFile(file({ type: 'IMAGE/PNG' }))).toBeNull();
  });

  it('accepts a file exactly at the 5MB limit', () => {
    expect(validateAvatarFile(file({ size: AVATAR_MAX_BYTES }))).toBeNull();
  });

  it('rejects a file one byte over the limit and names the size', () => {
    const msg = validateAvatarFile(file({ size: AVATAR_MAX_BYTES + 1 }));
    expect(msg).toContain('5MB');
    expect(msg).toContain('photo.png');
  });

  it('rejects a non-image mime type and names it', () => {
    const msg = validateAvatarFile(file({ name: 'clip.mov', type: 'video/quicktime' }));
    expect(msg).toContain('clip.mov');
    expect(msg).toContain('video/quicktime');
  });

  it('rejects an image type that is not on the allowlist', () => {
    expect(validateAvatarFile(file({ type: 'image/tiff' }))).not.toBeNull();
    expect(validateAvatarFile(file({ type: 'image/svg+xml' }))).not.toBeNull();
  });

  it('rejects a file with no reported type', () => {
    expect(validateAvatarFile(file({ type: '' }))).toContain('no recognisable image type');
  });

  it('rejects an empty file', () => {
    expect(validateAvatarFile(file({ size: 0 }))).toContain('empty');
  });
});

describe('formatBytes', () => {
  it('formats bytes, KB and MB', () => {
    expect(formatBytes(512)).toBe('512 bytes');
    expect(formatBytes(2048)).toBe('2KB');
    expect(formatBytes(6 * 1024 * 1024)).toBe('6.0MB');
  });
});
