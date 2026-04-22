import type { ExportFormat } from './tool-config';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  scale?: number;
  filename?: string;
  background?: string;
  padding?: number;
}

export interface ExportResult {
  success: boolean;
  data: Blob | string | null;
  filename: string;
  format: ExportFormat;
  error?: string;
}

export interface Exporter {
  format: ExportFormat;
  export: (
    element: HTMLElement,
    options: ExportOptions,
    stateSerializer?: () => string,
  ) => Promise<ExportResult>;
}