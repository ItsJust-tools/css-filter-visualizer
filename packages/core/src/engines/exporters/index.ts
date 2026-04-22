import type { Exporter, ExportFormat } from '../../types';

export { default as jsonExporter } from './json';

export type ExporterLoader = () => Promise<{ default: Exporter }>;

export const exporterLoaders: Partial<Record<ExportFormat, ExporterLoader>> = {};

export function registerExporterLoader(format: ExportFormat, loader: ExporterLoader): void {
  exporterLoaders[format] = loader;
}
