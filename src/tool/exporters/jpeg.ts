import type { Exporter } from '@itsjust/core';

const jpegExporter: Exporter = {
  format: 'jpeg',
  export: async (element, options) => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: options.scale ?? 2,
        backgroundColor: options.background ?? '#ffffff',
        logging: false,
        useCORS: true,
      });

      const quality = options.quality ?? 0.92;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/jpeg',
          quality,
        );
      });

      return {
        success: true,
        data: blob,
        filename: options.filename ?? `export-${Date.now()}.jpg`,
        format: 'jpeg',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        filename: options.filename ?? `export-${Date.now()}.jpg`,
        format: 'jpeg',
        error: error instanceof Error ? error.message : 'JPEG export failed',
      };
    }
  },
};

export default jpegExporter;
