import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShare } from '../../src/hooks/use-share';

describe('useShare', () => {
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  beforeEach(() => {
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('creates a share file blob', () => {
    const { result } = renderHook(() => useShare());

    const blob = result.current.createShareFile({
      toolId: 'test',
      content: JSON.stringify({ text: 'hello' }),
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');
  });

  it('downloads share file', async () => {
    const { result } = renderHook(() => useShare());
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await act(async () => {
      await result.current.downloadShareFile({
        toolId: 'test',
        content: JSON.stringify({ text: 'hello' }),
      });
    });

    expect(result.current.isCreating).toBe(false);
    expect(result.current.shareResult?.isFile).toBe(true);
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it('returns false when web share is not supported', async () => {
    const { result } = renderHook(() => useShare());

    const success = await act(async () => {
      return result.current.shareViaWeb({
        toolId: 'test',
        content: JSON.stringify({ text: 'hello' }),
      });
    });

    expect(success).toBe(false);
  });

  it('copies to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');
    const { result } = renderHook(() => useShare());

    const success = await act(async () => {
      return result.current.copyShareToClipboard({
        toolId: 'test',
        content: JSON.stringify({ text: 'hello' }),
      });
    });

    expect(success).toBe(true);
    expect(writeTextSpy).toHaveBeenCalled();

    writeTextSpy.mockRestore();
  });

  it('clears share result and error', async () => {
    const { result } = renderHook(() => useShare());
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await act(async () => {
      await result.current.downloadShareFile({
        toolId: 'test',
        content: JSON.stringify({ text: 'hello' }),
      });
    });

    expect(result.current.shareResult).not.toBeNull();

    act(() => {
      result.current.clearShare();
    });

    expect(result.current.shareResult).toBeNull();
    expect(result.current.error).toBeNull();

    clickSpy.mockRestore();
  });
});
