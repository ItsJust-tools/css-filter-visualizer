import { registerExporterLoader } from '@itsjust/core';

export function registerToolExporters() {
  registerExporterLoader('png', () => import('./png'));
  registerExporterLoader('jpeg', () => import('./jpeg'));
  registerExporterLoader('webp', () => import('./webp'));
  registerExporterLoader('pdf', () => import('./pdf'));
}
