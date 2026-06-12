import toolConfig from './tool.config';
import type { FilterState, FilterStep, ScalarFilterType } from './types';
import { createFilterStep } from './types';
import type { ExportFormat } from '@itsjust/core';

function isFilterStep(value: unknown): value is FilterStep {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== 'string' || typeof v.type !== 'string' || typeof v.enabled !== 'boolean')
    return false;
  const type = v.type as string;
  if (type === 'drop-shadow') {
    const ds = v.value as Record<string, unknown> | undefined;
    return (
      typeof ds === 'object' &&
      ds !== null &&
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

/**
 * Maps internal filter type names to their CSS function names.
 * All keys are literal `ScalarFilterType` values that produce a
 * one-to-one CSS function (e.g. `blur` → `blur()`, `hue-rotate` → `hue-rotate()`).
 */
const FILTER_CSS_MAP: Record<ScalarFilterType, string> = {
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

/**
 * Maps scalar filter types to their CSS unit suffix.
 * Extracted to avoid repeated if/else branching in `buildFilterCss`.
 */
const FILTER_UNIT_MAP: Record<ScalarFilterType, string> = {
  blur: 'px',
  brightness: '%',
  contrast: '%',
  grayscale: '%',
  'hue-rotate': 'deg',
  invert: '%',
  opacity: '%',
  saturate: '%',
  sepia: '%',
};

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

/**
 * Serializes an array of FilterStep into a complete CSS filter property value.
 * Each enabled step is converted to its CSS function form and joined with spaces.
 * Returns an empty string if no filters are enabled.
 *
 * Handles all supported filter types:
 * - Scalar filters (blur, brightness, contrast, etc.) with px/%/deg units
 * - Drop-shadow with offset, blur radius, and color
 * - SVG url() filter references
 *
 * @param steps - The array of filter steps to serialize
 * @returns CSS filter property value (e.g. "blur(5px) brightness(150%)")
 */
export function buildFilterCss(steps: FilterStep[]): string {
  return steps
    .filter((s) => s.enabled)
    .map((s) => {
      if (s.type === 'drop-shadow') {
        const ds = s.value;
        return `drop-shadow(${ds.offsetX}px ${ds.offsetY}px ${ds.blurRadius}px ${ds.color})`;
      }
      if (s.type === 'url') return `url(#filter-${s.id})`;

      const fn = FILTER_CSS_MAP[s.type];
      const unit = FILTER_UNIT_MAP[s.type];
      return `${fn}(${s.value}${unit})`;
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
      error:
        'Invalid data format: expected { steps: FilterStep[], baseColor: string, previewText: string }',
    };
  },
  exporters: [
    { format: 'png' as ExportFormat, loader: () => import('./exporters/png') },
    { format: 'jpeg' as ExportFormat, loader: () => import('./exporters/jpeg') },
    { format: 'webp' as ExportFormat, loader: () => import('./exporters/webp') },
    { format: 'pdf' as ExportFormat, loader: () => import('./exporters/pdf') },
  ],
};
