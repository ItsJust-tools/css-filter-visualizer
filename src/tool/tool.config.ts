import type { ToolConfig } from '@itsjust/core';

const toolConfig: ToolConfig = {
  id: 'template-tool',
  name: 'My Tool',
  description: 'A minimal tool template — customize it to build your own tool',
  version: '0.1.0',
  // Core ships with JSON export only.
  // To add image/PDF export, enable the format here and register
  // the lazy-loaded exporter in src/tool/exporters/index.ts.
  exportFormats: ['json'],
  features: {
    export: true,
    autoSave: true,
    undoRedo: true,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: {
    accent: '#3b82f6',
    accentHover: '#2563eb',
    accentSubtle: 'rgba(59, 130, 246, 0.08)',
    brand: 'My Tool',
    icon: '\u{1F6E0}',
  },
  shortcuts: [],
};

export default toolConfig;
