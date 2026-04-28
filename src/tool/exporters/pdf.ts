import type { Exporter } from '@itsjust/core';
import { formatExportError, renderCanvas, throwIfAborted } from './utils';

const pdfExporter: Exporter = {
  format: 'pdf',
  export: async (element, options) => {
    try {
      throwIfAborted(options.signal);
      const { jsPDF } = await import('jspdf');
      const canvas = await renderCanvas(element, options);

      const imgData = canvas.toDataURL('image/jpeg', options.quality ?? 0.92);
      const pxToMm = (px: number) => (px * 25.4) / 96;
      const widthMm = pxToMm(canvas.width);
      const heightMm = pxToMm(canvas.height);
      const orientation =
        options.orientation === 'portrait' || options.orientation === 'landscape'
          ? options.orientation
          : widthMm > heightMm
            ? 'landscape'
            : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [widthMm, heightMm],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm);
      const blob = pdf.output('blob');

      return {
        success: true,
        data: blob,
        filename: options.filename ?? `export-${Date.now()}.pdf`,
        format: 'pdf',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        filename: options.filename ?? `export-${Date.now()}.pdf`,
        format: 'pdf',
        error: formatExportError(error, 'PDF'),
      };
    }
  },
};

export default pdfExporter;
