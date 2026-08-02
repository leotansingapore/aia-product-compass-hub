import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  generateSecurePassword,
  UNAMBIGUOUS_CHARSET,
  STRONG_CHARSET,
} from './generatePassword';

describe('generateSecurePassword', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a password of the requested length', () => {
    expect(generateSecurePassword(12)).toHaveLength(12);
    expect(generateSecurePassword(1)).toHaveLength(1);
    expect(generateSecurePassword(64)).toHaveLength(64);
  });

  it('defaults to 12 characters from the unambiguous charset', () => {
    const pw = generateSecurePassword();
    expect(pw).toHaveLength(12);
    for (const ch of pw) expect(UNAMBIGUOUS_CHARSET).toContain(ch);
  });

  it('only emits characters from the supplied charset', () => {
    const pw = generateSecurePassword(200, STRONG_CHARSET);
    for (const ch of pw) expect(STRONG_CHARSET).toContain(ch);
  });

  it('excludes ambiguous glyphs from the default charset', () => {
    expect(UNAMBIGUOUS_CHARSET).not.toContain('0');
    expect(UNAMBIGUOUS_CHARSET).not.toContain('O');
    expect(UNAMBIGUOUS_CHARSET).not.toContain('1');
    expect(UNAMBIGUOUS_CHARSET).not.toContain('l');
    expect(UNAMBIGUOUS_CHARSET).not.toContain('I');
  });

  it('draws from crypto.getRandomValues, not Math.random', () => {
    const mathRandom = vi.spyOn(Math, 'random');
    const getRandomValues = vi.spyOn(globalThis.crypto, 'getRandomValues');

    generateSecurePassword(16);

    expect(getRandomValues).toHaveBeenCalled();
    expect(mathRandom).not.toHaveBeenCalled();

    mathRandom.mockRestore();
    getRandomValues.mockRestore();
  });

  it('rejects out-of-range bytes instead of biasing the modulo', () => {
    // charset of 10 => cutoff is 250; bytes 250..255 must be discarded.
    const charset = '0123456789';
    const scripted = [250, 251, 252, 253, 254, 255, 7, 3];
    let cursor = 0;
    vi.stubGlobal('crypto', {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = scripted[cursor % scripted.length];
          cursor++;
        }
        return arr;
      },
    });

    // The six >=250 bytes are rejected, so the output comes from 7 and 3.
    expect(generateSecurePassword(2, charset)).toBe('73');
  });

  it('produces different passwords across calls', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(generateSecurePassword(12));
    expect(seen.size).toBe(50);
  });

  it('covers the whole charset over many draws', () => {
    const charset = 'abcdef';
    const pw = generateSecurePassword(2000, charset);
    for (const ch of charset) expect(pw).toContain(ch);
  });

  it('rejects invalid arguments', () => {
    expect(() => generateSecurePassword(0)).toThrow(/greater than zero/);
    expect(() => generateSecurePassword(-1)).toThrow(/greater than zero/);
    expect(() => generateSecurePassword(8, 'a')).toThrow(/at least 2 characters/);
  });

  it('throws rather than falling back when Web Crypto is missing', () => {
    vi.stubGlobal('crypto', undefined);
    expect(() => generateSecurePassword(12)).toThrow(/Secure random/);
  });
});
