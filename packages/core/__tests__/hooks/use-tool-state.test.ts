import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolState } from '../../src/hooks/use-tool-state';

describe('useToolState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with given state', () => {
    const { result } = renderHook(() => useToolState({ text: 'hello' }));
    expect(result.current.data).toEqual({ text: 'hello' });
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it('supports undo/redo', () => {
    const { result } = renderHook(() => useToolState(0));
    act(() => result.current.setData(1));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.setData(2));
    act(() => vi.advanceTimersByTime(500));

    expect(result.current.data).toBe(2);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.data).toBe(1);
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.redo());
    expect(result.current.data).toBe(2);
    expect(result.current.canRedo).toBe(false);
  });

  it('tracks dirty state and auto-saves', () => {
    const { result } = renderHook(() =>
      useToolState('initial', { key: 'test-dirty', enabled: true, debounceMs: 500 }),
    );

    expect(result.current.isDirty).toBe(false);
    act(() => result.current.setData('changed'));
    expect(result.current.isDirty).toBe(true);

    act(() => vi.advanceTimersByTime(500));
    expect(result.current.isDirty).toBe(false);
    expect(result.current.lastSaved).not.toBeNull();

    const saved = localStorage.getItem('itsjust:test-dirty');
    expect(saved).not.toBeNull();
    expect(JSON.parse(saved!).data).toBe('changed');
  });

  it('limits history to max entries', () => {
    const { result } = renderHook(() => useToolState(0));

    for (let i = 1; i <= 60; i++) {
      act(() => result.current.setData(i));
      act(() => vi.advanceTimersByTime(500));
    }

    // Undo many times - should not go below the max history limit
    for (let i = 0; i < 60; i++) {
      act(() => result.current.undo());
    }

    // After exhausting history, data should be at the oldest preserved entry
    expect(result.current.data).toBeGreaterThan(0);
    expect(result.current.canUndo).toBe(false);
  });

  it('clearHistory resets state', () => {
    const { result } = renderHook(() => useToolState(0));
    act(() => result.current.setData(1));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.setData(2));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.clearHistory());

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('saveNow persists immediately', async () => {
    const { result } = renderHook(() =>
      useToolState('initial', { key: 'test-save-now', enabled: true }),
    );

    act(() => result.current.setData('manual'));
    expect(result.current.isDirty).toBe(true);

    await act(async () => {
      await result.current.saveNow();
    });
    expect(result.current.isDirty).toBe(false);

    const saved = localStorage.getItem('itsjust:test-save-now');
    expect(JSON.parse(saved!).data).toBe('manual');
  });
});
