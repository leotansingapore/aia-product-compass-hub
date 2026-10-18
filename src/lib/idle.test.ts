import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scheduleAfterLoad } from './idle';

// jsdom has no requestIdleCallback, so scheduleIdle falls back to a 200ms timeout.
describe('scheduleAfterLoad', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('waits the delay after an already-finished load, not the idle deadline alone', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    const cb = vi.fn();
    scheduleAfterLoad(3000, cb);
    vi.advanceTimersByTime(3000);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledOnce();
  });

  it('does not start counting until the load event fires', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const cb = vi.fn();
    scheduleAfterLoad(3000, cb);
    vi.advanceTimersByTime(10_000);
    expect(cb).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(3200);
    expect(cb).toHaveBeenCalledOnce();
  });
});
