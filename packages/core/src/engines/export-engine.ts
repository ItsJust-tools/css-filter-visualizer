import type { ExportFormat, ExportOptions, ExportResult, Exporter } from '../types';
import { jsonExporter, exporterLoaders } from './exporters';

function triggerDownload(result: ExportResult): void {
  if (!result.success || !result.data) return;

  const url =
    result.data instanceof Blob
      ? URL.createObjectURL(result.data)
      : `data:text/plain;charset=utf-8,${encodeURIComponent(result.data)}`;

  const link = document.createElement('a');
  link.href = url;
  link.download = result.filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (result.data instanceof Blob) {
    URL.revokeObjectURL(url);
  }
}

export class ExportEngine {
  private exporters: Map<ExportFormat, Exporter>;

  constructor() {
    this.exporters = new Map([['json', jsonExporter]]);
  }

  registerExporter(exporter: Exporter): void {
    this.exporters.set(exporter.format, exporter);
  }

  getSupportedFormats(): ExportFormat[] {
    return [...this.exporters.keys()];
  }

  async loadExporter(format: ExportFormat): Promise<Exporter | undefined> {
    if (this.exporters.has(format)) {
      return this.exporters.get(format);
    }

    const loader = exporterLoaders[format];
    if (!loader) return undefined;

    const mod = await loader();
    const exporter = mod.default;
    this.exporters.set(format, exporter);
    return exporter;
  }

  async export(
    element: HTMLElement,
    options: ExportOptions,
    stateSerializer?: () => string,
  ): Promise<ExportResult> {
    const exporter = await this.loadExporter(options.format);
    if (!exporter) {
      return {
        success: false,
        data: null,
        filename: options.filename ?? `export-${Date.now()}`,
        format: options.format,
        error: `No exporter registered for format: ${options.format}`,
      };
    }
    return exporter.export(element, options, stateSerializer);
  }

  async exportAndDownload(
    element: HTMLElement,
    options: ExportOptions,
    stateSerializer?: () => string,
  ): Promise<ExportResult> {
    const result = await this.export(element, options, stateSerializer);
    if (result.success) {
      triggerDownload(result);
    }
    return result;
  }
}

export function createExportEngine(): ExportEngine {
  return new ExportEngine();
}
