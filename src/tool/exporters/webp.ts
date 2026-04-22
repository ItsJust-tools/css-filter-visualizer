import type { Exporter } from '@itsjust/core';

const webpExporter: Exporter = {
  format: 'webp',
  export: async (element, options) => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: options.scale ?? 2,
        backgroundColor: options.background ?? '#ffffff',
        logging: false,
        useCORS: true,
      });

      const quality = options.quality ?? 0.9;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/webp',
          quality,
        );
      });

      return {
        success: true,
        data: blob,
        filename: options.filename ?? `export-${Date.now()}.webp`,
        format: 'webp',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        filename: options.filename ?? `export-${Date.now()}.webp`,
        format: 'webp',
        error: error instanceof Error ? error.message : 'WebP export failed',
      };
    }
  },
};

export default webpExporter;
