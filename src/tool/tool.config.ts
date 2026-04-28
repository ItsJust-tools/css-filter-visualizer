import type { ToolConfig } from '@itsjust/core';

const toolConfig = {
  id: 'template-tool',
  name: 'My Tool',
  description: 'A minimal tool template — customize it to build your own tool',
  version: '0.1.0',
  // Core ships with JSON export only.
  // To add image/PDF export, enable the format here and register
  // the lazy-loaded exporter in src/tool/tool-definition.ts.
  exportFormats: ['json', 'png', 'jpeg', 'webp', 'pdf'],
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
  shortcuts: [
    {
      title: 'My Tool',
      shortcuts: [
        { keys: 'Ctrl+Shift+E', label: 'Export All', description: 'exports all formats at once' },
      ],
    },
  ],
} satisfies ToolConfig;

export default toolConfig;
