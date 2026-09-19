import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard, useClipboard } from '../../src/hooks/use-clipboard';
import { renderHook, act } from '@testing-library/react';

describe('Clipboard utility and hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copies successfully using navigator.clipboard when available and working', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const result = await copyToClipboard('test-text');
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith('test-text');
  });

  it('falls back to document.execCommand when navigator.clipboard.writeText rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    const result = await copyToClipboard('fallback-text');
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith('fallback-text');
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('useClipboard hook handles copy and hasCopied state correctly', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    const { result } = renderHook(() => useClipboard());

    expect(result.current.hasCopied).toBe(false);

    await act(async () => {
      const success = await result.current.copy('hook-test');
      expect(success).toBe(true);
    });

    expect(result.current.hasCopied).toBe(true);
  });
});
