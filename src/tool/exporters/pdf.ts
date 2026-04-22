import type { Exporter } from '@itsjust/core';

const pdfExporter: Exporter = {
  format: 'pdf',
  export: async (element, options) => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(element, {
        scale: options.scale ?? 2,
        backgroundColor: options.background ?? '#ffffff',
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
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
        error: error instanceof Error ? error.message : 'PDF export failed',
      };
    }
  },
};

export default pdfExporter;
