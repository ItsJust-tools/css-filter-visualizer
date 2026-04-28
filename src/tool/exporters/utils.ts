import type { ExportFormat, ExportOptions, ExportResult, Exporter } from '@itsjust/core';

export function formatExportError(error: unknown, format: string): string {
  const base = error instanceof Error ? error.message : `${format} export failed`;
  const isCors = /cors|cross-origin|tainted|security/i.test(base);
  if (isCors) {
    return `${base}. Try removing external images or enable CORS on your assets.`;
  }
  return base;
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Export aborted', 'AbortError');
  }
}

export async function loadHtml2canvas(retries = 2, signal?: AbortSignal): Promise<typeof import('html2canvas').default> {
  throwIfAborted(signal);
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const mod = await import('html2canvas');
      throwIfAborted(signal);
      if (!mod.default) {
        throw new Error('html2canvas default export is missing');
      }
      return mod.default;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      lastError = error;
      if (i < retries) {
        await new Promise((resolve, reject) => {
          const base = 350 * 2 ** i;
          const jitter = Math.floor(Math.random() * 200);
          const t = setTimeout(resolve, base + jitter);
          signal?.addEventListener('abort', () => {
            clearTimeout(t);
            reject(new DOMException('Export aborted', 'AbortError'));
          });
        });
      }
    }
  }
  throw lastError ?? new Error('Failed to load html2canvas');
}

export async function renderCanvas(element: HTMLElement, options: ExportOptions): Promise<HTMLCanvasElement> {
  throwIfAborted(options.signal);
  if (!options.allowSensitiveData) {
    const sensitive = element.querySelector('input[type="password"], [data-sensitive="true"]');
    if (sensitive) {
      throw new Error('Export blocked: sensitive elements detected');
    }
  }
  const html2canvas = await loadHtml2canvas(2, options.signal);
  throwIfAborted(options.signal);
  return html2canvas(element, {
    scale: options.scale ?? 2,
    backgroundColor: options.background ?? '#ffffff',
    logging: false,
    useCORS: true,
  });
}

export function createCanvasExporter(
  format: ExportFormat,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp',
  defaultExt: 'png' | 'jpg' | 'webp',
  defaultQuality?: number,
): Exporter {
  return {
    format,
    export: async (element, options): Promise<ExportResult> => {
      try {
        const canvas = await renderCanvas(element, options);
        const quality = options.quality ?? defaultQuality;
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
            mimeType,
            quality,
          );
        });
        return {
          success: true,
          data: blob,
          filename: options.filename ?? `export-${Date.now()}.${defaultExt}`,
          format,
        };
      } catch (error) {
        return {
          success: false,
          data: null,
          filename: options.filename ?? `export-${Date.now()}.${defaultExt}`,
          format,
          error: formatExportError(error, format.toUpperCase()),
        };
      }
    },
  };
}
