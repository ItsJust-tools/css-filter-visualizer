import type { Exporter } from '@itsjust/core';

const pngExporter: Exporter = {
  format: 'png',
  export: async (element, options) => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: options.scale ?? 2,
        backgroundColor: options.background ?? '#ffffff',
        logging: false,
        useCORS: true,
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/png',
        );
      });

      return {
        success: true,
        data: blob,
        filename: options.filename ?? `export-${Date.now()}.png`,
        format: 'png',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        filename: options.filename ?? `export-${Date.now()}.png`,
        format: 'png',
        error: error instanceof Error ? error.message : 'PNG export failed',
      };
    }
  },
};

export default pngExporter;
