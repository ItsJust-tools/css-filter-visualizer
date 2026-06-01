import toolConfig from './tool.config';
import type { FilterState, FilterStep } from './types';
import { createFilterStep } from './types';
import type { ExportFormat } from '@itsjust/core';

function isFilterStep(value: unknown): value is FilterStep {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== 'string' || typeof v.type !== 'string' || typeof v.enabled !== 'boolean') return false;
  const type = v.type as string;
  if (type === 'drop-shadow') {
    const ds = v.value as Record<string, unknown> | undefined;
    return (
      typeof ds === 'object' && ds !== null &&
      typeof ds.offsetX === 'number' &&
      typeof ds.offsetY === 'number' &&
      typeof ds.blurRadius === 'number' &&
      typeof ds.color === 'string'
    );
  }
  if (type === 'url') {
    return v.value === undefined || v.value === null;
  }
  return typeof v.value === 'number';
}

function isFilterState(value: unknown): value is FilterState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v.steps) || !v.steps.every(isFilterStep)) return false;
  if (typeof v.baseColor !== 'string') return false;
  if (typeof v.previewText !== 'string') return false;
  if (v.presetName !== undefined && typeof v.presetName !== 'string') return false;
  return true;
}


const DEFAULT_FILTERS: FilterStep[] = [
  createFilterStep('blur', 0),
  createFilterStep('brightness', 100),
  createFilterStep('contrast', 100),
  createFilterStep('saturate', 100),
];

export const initialState: FilterState = {
  steps: DEFAULT_FILTERS,
  baseColor: '#6366f1',
  previewText: 'Hello, Filter World!',
  presetName: '',
};

export function buildFilterCss(steps: FilterStep[]): string {
  return steps
    .filter((s) => s.enabled)
    .map((s) => {
      if (s.type === 'drop-shadow') {
        const ds = s.value;
        return `drop-shadow(${ds.offsetX}px ${ds.offsetY}px ${ds.blurRadius}px ${ds.color})`;
      }
      if (s.type === 'url') return `url(#filter-${s.id})`;
      const typeMap: Record<string, string> = {
        blur: 'blur',
        brightness: 'brightness',
        contrast: 'contrast',
        grayscale: 'grayscale',
        'hue-rotate': 'hue-rotate',
        invert: 'invert',
        opacity: 'opacity',
        saturate: 'saturate',
        sepia: 'sepia',
      };
      const fn = typeMap[s.type];
      if (!fn) return '';
      if (s.type === 'blur') return `${fn}(${s.value}px)`;
      if (s.type === 'hue-rotate') return `${fn}(${s.value}deg)`;
      return `${fn}(${s.value}%)`;
    })
    .join(' ');
}

export const cssFilterTool = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState,
  serialize: (state: FilterState) => JSON.stringify(state, null, 2),
  deserialize: (data: unknown) => {
    if (isFilterState(data)) {
      return { success: true as const, data };
    }
    return {
      success: false as const,
      error: 'Invalid data format: expected { steps: FilterStep[], baseColor: string, previewText: string }',
    };
  },
  exporters: [
    { format: 'png' as ExportFormat, loader: () => import('./exporters/png') },
    { format: 'jpeg' as ExportFormat, loader: () => import('./exporters/jpeg') },
    { format: 'webp' as ExportFormat, loader: () => import('./exporters/webp') },
    { format: 'pdf' as ExportFormat, loader: () => import('./exporters/pdf') },
  ],
};
