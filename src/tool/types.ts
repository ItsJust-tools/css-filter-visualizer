/** Supported filter types that accept a single numeric value (percentage, pixels, or degrees). */
export type ScalarFilterType =
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'grayscale'
  | 'hue-rotate'
  | 'invert'
  | 'opacity'
  | 'saturate'
  | 'sepia';

/** All supported CSS filter types, including compound types like drop-shadow and SVG url(). */
export type FilterType = ScalarFilterType | 'drop-shadow' | 'url';

/**
 * Value type for the drop-shadow filter.
 * Contains offset, blur, and color properties matching the CSS drop-shadow() function.
 */
export interface DropShadowValue {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  color: string;
}

/** Filter step for scalar-valued filters (blur, brightness, contrast, etc.). */
export interface ScalarFilterStep {
  id: string;
  type: ScalarFilterType;
  value: number;
  enabled: boolean;
}

/** Filter step for the drop-shadow() CSS filter. */
export interface DropShadowFilterStep {
  id: string;
  type: 'drop-shadow';
  value: DropShadowValue;
  enabled: boolean;
}

/** Filter step for SVG url() filter references. No scalar value needed. */
export interface UrlFilterStep {
  id: string;
  type: 'url';
  value: undefined;
  enabled: boolean;
}

/** Discriminated union of all possible filter step types. */
export type FilterStep = ScalarFilterStep | DropShadowFilterStep | UrlFilterStep;

/** Complete serializable state of the CSS Filter Visualizer. */
export interface FilterState {
  steps: FilterStep[];
  baseColor: string;
  previewText: string;
  presetName: string;
}

/** A named preset of filter steps for quick application. */
export interface Preset {
  name: string;
  description: string;
  steps: FilterStep[];
}

/**
 * Configuration metadata for a filter type: label, unit, range, defaults, and description.
 *
 * For scalar filters (blur, brightness, etc.):
 * - `unit`: CSS unit suffix (px, %, deg)
 * - `min`/`max`: slider bounds
 * - `default`: initial slider value
 *
 * For drop-shadow:
 * - `unit`, `min`, `max`, `default` refer to the blur-radius sub-property
 * - The other sub-property defaults (offsetX: 2, offsetY: 2, color: #00000066)
 *   are set in `createFilterStep()`
 *
 * For url:
 * - No scalar value; all numeric fields are informational only.
 */
type FilterTypeConfig = {
  type: FilterType;
  label: string;
  unit: string;
  min: number;
  max: number;
  default: number;
};

export const FILTER_TYPES: FilterTypeConfig[] = [
  { type: 'blur', label: 'Blur', unit: 'px', min: 0, max: 20, default: 5 },
  { type: 'brightness', label: 'Brightness', unit: '%', min: 0, max: 200, default: 150 },
  { type: 'contrast', label: 'Contrast', unit: '%', min: 0, max: 200, default: 150 },
  { type: 'grayscale', label: 'Grayscale', unit: '%', min: 0, max: 100, default: 100 },
  { type: 'hue-rotate', label: 'Hue Rotate', unit: 'deg', min: 0, max: 360, default: 180 },
  { type: 'invert', label: 'Invert', unit: '%', min: 0, max: 100, default: 100 },
  { type: 'opacity', label: 'Opacity', unit: '%', min: 0, max: 100, default: 50 },
  { type: 'saturate', label: 'Saturate', unit: '%', min: 0, max: 300, default: 200 },
  { type: 'sepia', label: 'Sepia', unit: '%', min: 0, max: 100, default: 100 },
  { type: 'drop-shadow', label: 'Drop Shadow', unit: 'px', min: 0, max: 20, default: 4 },
];

/**
 * Create a new filter step with a unique ID and sensible defaults.
 *
 * Overloaded signatures ensure type safety:
 * - Scalar filters require a numeric value
 * - Drop-shadow and url filters use their own default values
 *
 * @param type - The filter type to create
 * @param value - Numeric value (required for scalar filters, ignored for drop-shadow/url)
 * @returns A fully populated FilterStep with a unique ID
 */
export function createFilterStep(type: ScalarFilterType, value: number): ScalarFilterStep;
export function createFilterStep(type: 'drop-shadow'): DropShadowFilterStep;
export function createFilterStep(type: 'url'): UrlFilterStep;
export function createFilterStep(type: FilterType, value?: number): FilterStep {
  const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (type === 'drop-shadow') {
    return {
      id,
      type,
      value: { offsetX: 2, offsetY: 2, blurRadius: 4, color: '#00000066' },
      enabled: true,
    };
  }
  if (type === 'url') {
    return { id, type, value: undefined, enabled: true };
  }
  return { id, type: type as ScalarFilterType, value: value ?? 50, enabled: true };
}

export const PRESETS: Preset[] = [
  {
    name: 'Vintage',
    description: 'Warm retro photo look',
    steps: [
      { id: 'p1', type: 'sepia', value: 60, enabled: true },
      { id: 'p2', type: 'contrast', value: 120, enabled: true },
      { id: 'p3', type: 'brightness', value: 110, enabled: true },
    ],
  },
  {
    name: 'Vivid',
    description: 'High saturation and contrast',
    steps: [
      { id: 'p4', type: 'saturate', value: 180, enabled: true },
      { id: 'p5', type: 'contrast', value: 140, enabled: true },
      { id: 'p6', type: 'brightness', value: 110, enabled: true },
    ],
  },
  {
    name: 'Noir',
    description: 'Classic black and white',
    steps: [
      { id: 'p7', type: 'grayscale', value: 100, enabled: true },
      { id: 'p8', type: 'contrast', value: 150, enabled: true },
      { id: 'p9', type: 'brightness', value: 90, enabled: true },
    ],
  },
  {
    name: 'Dreamy',
    description: 'Soft blur with warm tones',
    steps: [
      { id: 'p10', type: 'blur', value: 3, enabled: true },
      { id: 'p11', type: 'brightness', value: 120, enabled: true },
      { id: 'p12', type: 'sepia', value: 30, enabled: true },
    ],
  },
  {
    name: 'Dramatic',
    description: 'High contrast, low brightness',
    steps: [
      { id: 'p13', type: 'contrast', value: 180, enabled: true },
      { id: 'p14', type: 'brightness', value: 80, enabled: true },
      { id: 'p15', type: 'saturate', value: 80, enabled: true },
    ],
  },
  {
    name: 'Frosted Glass',
    description: 'Modern frosted glass effect with shadow and blur',
    steps: [
      { id: 'p16', type: 'blur', value: 4, enabled: true },
      { id: 'p17', type: 'brightness', value: 120, enabled: true },
      { id: 'p18', type: 'saturate', value: 80, enabled: true },
      {
        id: 'p19',
        type: 'drop-shadow',
        value: { offsetX: 0, offsetY: 4, blurRadius: 12, color: '#00000033' },
        enabled: true,
      },
    ],
  },
];
