import { describe, it, expect } from 'vitest';
import { createMockToolState } from '@itsjust/core/testing';
import { myTool } from '@/tool/tool-definition';
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

describe('Tool deserialize', () => {
  it('accepts valid tool state object', () => {
    const result = myTool.deserialize({ title: 'Valid Title' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Valid Title');
    }
  });

  it('rejects null data', () => {
    const result = myTool.deserialize(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects non-object data', () => {
    const result = myTool.deserialize('string');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects object without title', () => {
    const result = myTool.deserialize({ count: 42 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects object with non-string title', () => {
    const result = myTool.deserialize({ title: 123 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('serializes state to JSON string', () => {
    const json = myTool.serialize({ title: 'Test' });
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)).toEqual({ title: 'Test' });
  });
});
