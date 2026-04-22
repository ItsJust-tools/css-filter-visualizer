'use client';

import { useCallback, useRef } from 'react';
import type { ExportFormat, ExportOptions, ToolConfig } from '../types';
import { createExportEngine } from '../engines/export-engine';

export function useExport(
  canvasRef: React.RefObject<HTMLElement | null>,
  config: ToolConfig,
  stateSerializer?: () => string,
) {
  const engineRef = useRef(createExportEngine());
  const exportingRef = useRef(false);

  const exportTo = useCallback(
    async (format: ExportFormat, options?: Partial<ExportOptions>) => {
      if (!canvasRef.current || exportingRef.current) return null;
      exportingRef.current = true;

      try {
        const merged: ExportOptions = {
          format,
          scale: 2,
          background: '#ffffff',
          ...options,
        };
        return await engineRef.current.exportAndDownload(
          canvasRef.current,
          merged,
          stateSerializer,
        );
      } finally {
        exportingRef.current = false;
      }
    },
    [canvasRef, stateSerializer],
  );

  return {
    exportTo,
    supportedFormats: config.exportFormats,
  };
}
