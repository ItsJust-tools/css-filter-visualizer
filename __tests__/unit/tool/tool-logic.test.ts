import { describe, it, expect } from 'vitest';
import { createMockToolState } from '@itsjust/core/testing';
import type { ToolState } from '@/tool/types';

describe('Tool logic', () => {
  it('initializes with default state', () => {
    const state = createMockToolState<ToolState>({
      title: 'My Tool',
    });

    expect(state.data.title).toBe('My Tool');
  });

  it('updates title', () => {
    const state = createMockToolState<ToolState>({
      title: 'My Tool',
    });

    state.setData((prev) => ({ ...prev, title: 'New Name' }));
    expect(state.data.title).toBe('New Name');
  });

  it('supports undo/redo', () => {
    const state = createMockToolState<ToolState>({
      title: 'First',
    });

    state.setData((prev) => ({ ...prev, title: 'Second' }));
    expect(state.data.title).toBe('Second');
    expect(state.canUndo).toBe(true);

    state.undo();
    expect(state.data.title).toBe('First');
    expect(state.canRedo).toBe(true);

    state.redo();
    expect(state.data.title).toBe('Second');
  });
});
