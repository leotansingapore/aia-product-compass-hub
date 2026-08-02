/**
 * Cryptographically secure password generation for admin-issued credentials.
 *
 * `Math.random()` is a seeded PRNG — its output is predictable from a handful of
 * observed values, which is unacceptable for temporary passwords an admin hands
 * to a user. This helper draws from `crypto.getRandomValues` and uses rejection
 * sampling so every character in the alphabet is equally likely (a plain
 * `byte % charset.length` would bias the first `256 % length` characters).
 */

/** Ambiguous-glyph-free alphabet (no 0/O, 1/l/I) for passwords read aloud or retyped. */
export const UNAMBIGUOUS_CHARSET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/** Full alphabet including symbols, for passwords that are copy-pasted. */
export const STRONG_CHARSET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

function getCrypto(): Crypto {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (!c || typeof c.getRandomValues !== 'function') {
    throw new Error('Secure random number generation is unavailable in this browser.');
  }
  return c;
}

/**
 * Generate a random password of `length` characters drawn uniformly from `charset`.
 *
 * @throws if the environment has no Web Crypto, rather than silently falling
 *         back to a predictable source.
 */
export function generateSecurePassword(
  length = 12,
  charset: string = UNAMBIGUOUS_CHARSET,
): string {
  if (length <= 0) throw new Error('Password length must be greater than zero.');
  if (charset.length < 2) throw new Error('Password charset must contain at least 2 characters.');

  const crypto = getCrypto();
  // Largest multiple of charset.length that fits in a byte; bytes at or above
  // this cutoff are discarded so the modulo below stays uniform.
  const cutoff = Math.floor(256 / charset.length) * charset.length;

  let result = '';
  const buffer = new Uint8Array(length);
  while (result.length < length) {
    crypto.getRandomValues(buffer);
    for (let i = 0; i < buffer.length && result.length < length; i++) {
      const byte = buffer[i];
      if (byte >= cutoff) continue; // reject — would skew the distribution
      result += charset.charAt(byte % charset.length);
    }
  }

  return result;
}
