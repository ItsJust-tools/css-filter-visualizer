import { describe, it, expect } from 'vitest';
import { ExportEngine } from '../../src/engines/export-engine';
import type { Exporter, ExportOptions } from '../../src/types';

describe('ExportEngine', () => {
  it('lists built-in formats', () => {
    const engine = new ExportEngine();
    const formats = engine.getSupportedFormats();
    expect(formats).toContain('json');
  });

  it('registers a custom exporter', () => {
    const engine = new ExportEngine();
    const customExporter: Exporter = {
      format: 'json',
      export: async (_el, _opts, serializer) => ({
        success: true,
        data: serializer?.() ?? '{}',
        filename: 'custom.json',
        format: 'json',
      }),
    };

    engine.registerExporter(customExporter);
    expect(engine.getSupportedFormats()).toContain('json');
  });

  it('returns error for unsupported format', async () => {
    const engine = new ExportEngine();
    const result = await engine.export(
      document.createElement('div'),
      { format: 'xml' } as unknown as ExportOptions,
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('No exporter');
  });
});