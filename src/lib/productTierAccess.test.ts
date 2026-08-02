import { describe, it, expect } from 'vitest';
import { passesProductTierGate } from './productTierAccess';

describe('passesProductTierGate', () => {
  it('allows when the product has no tier restriction', () => {
    expect(passesProductTierGate(null, 'explorer', false)).toBe(true);
    expect(passesProductTierGate(undefined, 'explorer', false)).toBe(true);
    expect(passesProductTierGate([], 'explorer', false)).toBe(true);
  });

  it('allows when the user tier is listed', () => {
    expect(passesProductTierGate(['papers_taker', 'post_rnf'], 'post_rnf', false)).toBe(true);
  });

  it('blocks when the user tier is not listed', () => {
    expect(passesProductTierGate(['post_rnf'], 'explorer', false)).toBe(false);
    expect(passesProductTierGate(['papers_taker'], 'post_rnf', false)).toBe(false);
  });

  it('blocks a restricted product when the tier is unknown', () => {
    expect(passesProductTierGate(['post_rnf'], null, false)).toBe(false);
    expect(passesProductTierGate(['post_rnf'], undefined, false)).toBe(false);
    expect(passesProductTierGate(['post_rnf'], '', false)).toBe(false);
  });

  it('lets a real admin bypass any restriction', () => {
    expect(passesProductTierGate(['post_rnf'], 'explorer', true)).toBe(true);
    expect(passesProductTierGate([], 'explorer', true)).toBe(true);
    expect(passesProductTierGate(['nobody'], null, true)).toBe(true);
  });

  it('treats a non-array visible_tiers value as unrestricted', () => {
    expect(passesProductTierGate('post_rnf' as unknown as string[], 'explorer', false)).toBe(true);
  });
});
