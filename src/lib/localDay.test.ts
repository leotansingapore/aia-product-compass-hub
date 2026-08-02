import { describe, expect, it } from 'vitest';
import { addDays, localDayIso, startOfLocalDay, startOfLocalDayIso } from './localDay';

describe('localDayIso', () => {
  it('formats the local calendar day as YYYY-MM-DD', () => {
    // Constructed from local components, so this is 2026-08-02 locally
    // regardless of the machine's timezone.
    expect(localDayIso(new Date(2026, 7, 2, 13, 45))).toBe('2026-08-02');
  });

  it('zero-pads single-digit months and days', () => {
    expect(localDayIso(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05');
  });

  it('still reports the local day late at night, when the UTC day has already rolled', () => {
    // 23:30 local on the 2nd. In any timezone ahead of UTC this instant is
    // already the 3rd in UTC — toISOString().split('T')[0] would say so.
    const lateNight = new Date(2026, 7, 2, 23, 30);
    expect(localDayIso(lateNight)).toBe('2026-08-02');
  });

  it('still reports the local day early in the morning, when UTC is still on yesterday', () => {
    const earlyMorning = new Date(2026, 7, 3, 0, 30);
    expect(localDayIso(earlyMorning)).toBe('2026-08-03');
  });

  it('gives the same answer for every instant within one local day', () => {
    const day = new Date(2026, 7, 2);
    const hours = Array.from({ length: 24 }, (_, h) => new Date(2026, 7, 2, h, 30));
    for (const instant of hours) {
      expect(localDayIso(instant)).toBe(localDayIso(day));
    }
  });
});

describe('startOfLocalDay', () => {
  it('zeroes the time-of-day without changing the calendar day', () => {
    const start = startOfLocalDay(new Date(2026, 7, 2, 21, 15, 30, 500));
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(7);
    expect(start.getDate()).toBe(2);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });

  it('is never later than the instant it was derived from', () => {
    const now = new Date(2026, 7, 2, 0, 0, 1);
    expect(startOfLocalDay(now).getTime()).toBeLessThanOrEqual(now.getTime());
  });
});

describe('startOfLocalDayIso', () => {
  it('is a valid ISO timestamp for the local midnight instant', () => {
    const iso = startOfLocalDayIso(new Date(2026, 7, 2, 21, 15));
    expect(iso).toBe(new Date(2026, 7, 2).toISOString());
    expect(Number.isNaN(Date.parse(iso))).toBe(false);
  });

  it('bounds the whole local day — 23:59 local is after it, 23:59 yesterday is before', () => {
    const boundary = Date.parse(startOfLocalDayIso(new Date(2026, 7, 2, 12, 0)));
    expect(new Date(2026, 7, 2, 23, 59).getTime()).toBeGreaterThan(boundary);
    expect(new Date(2026, 7, 1, 23, 59).getTime()).toBeLessThan(boundary);
  });
});

describe('addDays', () => {
  it('walks backwards a calendar day', () => {
    expect(localDayIso(addDays(-1, new Date(2026, 7, 2, 12, 0)))).toBe('2026-08-01');
  });

  it('crosses a month boundary', () => {
    expect(localDayIso(addDays(-1, new Date(2026, 7, 1, 12, 0)))).toBe('2026-07-31');
  });

  it('crosses a year boundary', () => {
    expect(localDayIso(addDays(1, new Date(2026, 11, 31, 12, 0)))).toBe('2027-01-01');
  });

  it('handles a leap day', () => {
    expect(localDayIso(addDays(1, new Date(2028, 1, 28, 12, 0)))).toBe('2028-02-29');
  });

  it('does not mutate the input date', () => {
    const original = new Date(2026, 7, 2, 12, 0);
    const snapshot = original.getTime();
    addDays(-5, original);
    expect(original.getTime()).toBe(snapshot);
  });
});
