import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, useSessionStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  it('sets value in state and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    act(() => {
      result.current[1]('new-value');
    });
    expect(result.current[0]).toBe('new-value');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('new-value');
  });

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(1);
  });

  it('removes value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe('default');
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('handles complex objects', () => {
    const obj = { a: 1, b: [2, 3], c: { d: true } };
    const { result } = renderHook(() => useLocalStorage('obj-key', obj));
    expect(result.current[0]).toEqual(obj);

    const updated = { ...obj, a: 99 };
    act(() => {
      result.current[1](updated);
    });
    expect(result.current[0]).toEqual(updated);
  });

  it('falls back to initial value on corrupted JSON', () => {
    localStorage.setItem('bad-key', 'not-json{{{');
    const { result } = renderHook(() => useLocalStorage('bad-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });
});

describe('useSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns initial value when nothing is stored', () => {
    const { result } = renderHook(() => useSessionStorage('sess-key', 42));
    expect(result.current[0]).toBe(42);
  });

  it('sets and persists value', () => {
    const { result } = renderHook(() => useSessionStorage('sess-key', ''));
    act(() => {
      result.current[1]('hello');
    });
    expect(result.current[0]).toBe('hello');
    expect(JSON.parse(sessionStorage.getItem('sess-key')!)).toBe('hello');
  });
});
