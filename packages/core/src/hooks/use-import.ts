'use client';

import { useCallback, useState } from 'react';
import type { ExportFormat } from '../types';

export interface ImportResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fileName?: string;
  format?: ExportFormat;
  isItsJustFile?: boolean;
  toolId?: string;
}

export interface UseImportOptions {
  /** Accepted file formats (default: json, svg) */
  acceptedFormats?: ExportFormat[];
  /** Called when a file is selected and imported (client-side only) */
  onImport?: (result: ImportResult) => void;
}

export function useImport<T = unknown>({ acceptedFormats, onImport }: UseImportOptions = {}) {
  const [isImporting, setIsImporting] = useState(false);
  const [lastImport, setLastImport] = useState<ImportResult<T> | null>(null);

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  const parseFile = useCallback(
    async (file: File): Promise<ImportResult<T>> => {
      // Client-side only - no server upload
      const ext = file.name.split('.').pop()?.toLowerCase();
      const format: ExportFormat | undefined = ext === 'png' || ext === 'jpeg' || ext === 'webp' || ext === 'pdf' || ext === 'json' ? ext : undefined;

      // Check for .itsjust.json files (our share format)
      if (file.name.endsWith('.itsjust.json')) {
        try {
          const text = await file.text();
          const parsed: unknown = JSON.parse(text);

          if (
            !isRecord(parsed) ||
            parsed.$schema !== 'itsjust-tool' ||
            !isRecord(parsed.content)
          ) {
            return {
              success: false,
              error: 'Invalid .itsjust.json file format',
              fileName: file.name,
              format: 'json',
              isItsJustFile: true,
            };
          }

          const result: ImportResult<T> = {
            success: true,
            data: parsed.content as T,
            fileName: file.name,
            format: 'json',
            isItsJustFile: true,
            toolId: typeof parsed.toolId === 'string' ? parsed.toolId : undefined,
          };

          setLastImport(result);
          onImport?.(result);
          return result;
        } catch (error) {
          const result: ImportResult<T> = {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse .itsjust.json file',
            fileName: file.name,
            format: 'json',
            isItsJustFile: true,
          };

          setLastImport(result);
          onImport?.(result);
          return result;
        }
      }

      // Standard format handling
      if (acceptedFormats && format && !acceptedFormats.includes(format)) {
        return {
          success: false,
          error: `Unsupported format: .${format}. Accepted: ${acceptedFormats.join(', ')}`,
          fileName: file.name,
        };
      }

      try {
        // For JSON format
        if (format === 'json') {
          const text = await file.text();
          const data: unknown = JSON.parse(text);

          const result: ImportResult<T> = {
            success: true,
            data: data as T,
            fileName: file.name,
            format,
          };

          setLastImport(result);
          onImport?.(result);
          return result;
        }

        // For binary formats (png, jpeg, webp, pdf) - return as base64 for client-side processing
        return new Promise<ImportResult<T>>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result: ImportResult<T> = {
              success: true,
              data: (typeof reader.result === 'string' ? reader.result : '') as T,
              fileName: file.name,
              format,
            };
            setLastImport(result);
            onImport?.(result);
            resolve(result);
          };
          reader.onerror = () => {
            const result: ImportResult<T> = {
              success: false,
              error: 'Failed to read file',
              fileName: file.name,
              format,
            };
            setLastImport(result);
            onImport?.(result);
            resolve(result);
          };
          reader.readAsDataURL(file);
        });
      } catch (error) {
        const result: ImportResult<T> = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to parse file',
          fileName: file.name,
          format,
        };

        setLastImport(result);
        onImport?.(result);
        return result;
      }
    },
    [acceptedFormats, onImport],
  );

  const importFromFile = useCallback(
    async (file: File): Promise<ImportResult<T>> => {
      setIsImporting(true);
      try {
        return await parseFile(file);
      } finally {
        setIsImporting(false);
      }
    },
    [parseFile],
  );

  const importFromEvent = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>): Promise<ImportResult<T> | null> => {
      const file = event.target.files?.[0];
      if (!file) return null;

      return importFromFile(file);
    },
    [importFromFile],
  );

  const clearImport = useCallback(() => {
    setLastImport(null);
  }, []);

  return {
    isImporting,
    lastImport,
    importFromFile,
    importFromEvent,
    clearImport,
  };
}
