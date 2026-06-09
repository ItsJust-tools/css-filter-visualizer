import type { ToolConfig } from '@itsjust/core';
import packageJson from '../../package.json';

export const templateBaseVersion = packageJson.version;

/**
 * Tool configuration for the CSS Filter Visualizer.
 * Defines tool metadata, features, theming, and keyboard shortcuts.
 */
const toolConfig = {
  id: 'css-filter-visualizer',
  name: 'CSS Filter Visualizer',
  description:
    'Build and preview CSS filter chains visually. Combine blur, brightness, contrast, and more — see the result in real time.',
  version: '1.1.0',
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
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentSubtle: 'rgba(139, 92, 246, 0.08)',
    brand: 'CSS Filter Visualizer',
    icon: '\u{1F3A8}',
  },
  shortcuts: [
    {
      title: 'CSS Filter Visualizer',
      shortcuts: [
        { keys: 'Ctrl+Shift+E', label: 'Export All', description: 'exports all formats at once' },
        { keys: 'Ctrl+Shift+N', label: 'New Filter', description: 'add a new filter step' },
        { keys: 'Delete', label: 'Remove Filter', description: 'remove selected filter step' },
        { keys: 'Ctrl+Shift+↑', label: 'Move Up', description: 'move selected filter up in chain' },
        { keys: 'Ctrl+Shift+↓', label: 'Move Down', description: 'move selected filter down in chain' },
      ],
    },
  ],
} satisfies ToolConfig;

export default toolConfig;
