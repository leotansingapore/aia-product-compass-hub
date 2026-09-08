import { describe, expect, it } from 'vitest';
import { createSlug, getVideoSlug, resolveLessonIndexFromSlug } from './slugUtils';

describe('createSlug', () => {
  it('strips punctuation and collapses whitespace', () => {
    expect(createSlug('Closed $400/mth APA')).toBe('closed-400mth-apa');
    expect(createSlug('APA vs. ETFs')).toBe('apa-vs-etfs');
    expect(createSlug('  27th Feb -  ')).toBe('27th-feb');
  });

  it('collides when two titles differ only by punctuation or case', () => {
    // Both pairs exist in production today. The collision is why
    // resolveLessonIndexFromSlug cannot rely on findIndex alone.
    expect(createSlug('APA vs. ETFs')).toBe(createSlug('APA vs ETFs'));
    expect(createSlug('Asking for And Calling Referrals'))
      .toBe(createSlug('Asking for and Calling Referrals'));
  });
});

describe('resolveLessonIndexFromSlug', () => {
  const titles = [
    '20th Feb - PWV illustrator walkthrough',
    'Closed $400/mth APA',
    'Audio Recordings',
    'Closed $400/mth APA',
  ];

  it('opens the lesson a deep link names', () => {
    expect(resolveLessonIndexFromSlug(titles, getVideoSlug('Audio Recordings'), 0)).toBe(2);
  });

  it('keeps the lesson the learner clicked when a twin shares its slug', () => {
    // The learner clicked index 3; the URL now carries a slug that index 1 also
    // matches. Without the guard this returns 1 and the player jumps backwards.
    const slug = getVideoSlug('Closed $400/mth APA');
    expect(resolveLessonIndexFromSlug(titles, slug, 3)).toBe(3);
  });

  it('falls back to the first twin on a cold load', () => {
    const slug = getVideoSlug('Closed $400/mth APA');
    expect(resolveLessonIndexFromSlug(titles, slug, 0)).toBe(1);
  });

  it('leaves the current lesson alone for an unknown or missing slug', () => {
    expect(resolveLessonIndexFromSlug(titles, 'not-a-lesson', 2)).toBe(2);
    expect(resolveLessonIndexFromSlug(titles, undefined, 2)).toBe(2);
    expect(resolveLessonIndexFromSlug([], 'anything', 0)).toBe(0);
  });

  it('tolerates a lesson with no title', () => {
    expect(resolveLessonIndexFromSlug(['', 'Audio Recordings'], 'audio-recordings', 0)).toBe(1);
  });
});
