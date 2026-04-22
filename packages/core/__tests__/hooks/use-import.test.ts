import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImport } from '../../src/hooks/use-import';

function createFile(name: string, content: string, type = 'application/json'): File {
  return new File([content], name, { type });
}

describe('useImport', () => {
  it('imports a valid .itsjust.json file', async () => {
    const onImport = vi.fn();
    const { result } = renderHook(() =>
      useImport({ acceptedFormats: ['json'], onImport }),
    );

    const file = createFile(
      'test.itsjust.json',
      JSON.stringify({
        $schema: 'itsjust-tool',
        toolId: 'simple-notepad',
        content: { text: 'hello world' },
      }),
    );

    let importResult: Awaited<ReturnType<typeof result.current.importFromFile>> | undefined;
    await act(async () => {
      importResult = await result.current.importFromFile(file);
    });

    expect(importResult!.success).toBe(true);
    expect(importResult!.isItsJustFile).toBe(true);
    expect((importResult!.data as { text: string }).text).toBe('hello world');
    expect(onImport).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported formats', async () => {
    const { result } = renderHook(() => useImport({ acceptedFormats: ['json'] }));

    const file = createFile('test.png', 'binary', 'image/png');

    let importResult: Awaited<ReturnType<typeof result.current.importFromFile>> | undefined;
    await act(async () => {
      importResult = await result.current.importFromFile(file);
    });

    expect(importResult!.success).toBe(false);
    expect(importResult!.error).toContain('Unsupported format');
  });

  it('rejects invalid .itsjust.json format', async () => {
    const { result } = renderHook(() => useImport({ acceptedFormats: ['json'] }));

    const file = createFile(
      'bad.itsjust.json',
      JSON.stringify({ notASchema: 'nope' }),
    );

    let importResult: Awaited<ReturnType<typeof result.current.importFromFile>> | undefined;
    await act(async () => {
      importResult = await result.current.importFromFile(file);
    });

    expect(importResult!.success).toBe(false);
    expect(importResult!.error).toContain('Invalid .itsjust.json');
  });

  it('imports a plain JSON file', async () => {
    const { result } = renderHook(() => useImport({ acceptedFormats: ['json'] }));

    const file = createFile('data.json', JSON.stringify({ foo: 'bar' }));

    let importResult: Awaited<ReturnType<typeof result.current.importFromFile>> | undefined;
    await act(async () => {
      importResult = await result.current.importFromFile(file);
    });

    expect(importResult!.success).toBe(true);
    expect(importResult!.data).toEqual({ foo: 'bar' });
  });
});
