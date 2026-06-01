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

export type FilterType = ScalarFilterType | 'drop-shadow' | 'url';

export interface DropShadowValue {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  color: string;
}

export interface ScalarFilterStep {
  id: string;
  type: ScalarFilterType;
  value: number;
  enabled: boolean;
}

export interface DropShadowFilterStep {
  id: string;
  type: 'drop-shadow';
  value: DropShadowValue;
  enabled: boolean;
}

export interface UrlFilterStep {
  id: string;
  type: 'url';
  value: undefined;
  enabled: boolean;
}

export type FilterStep = ScalarFilterStep | DropShadowFilterStep | UrlFilterStep;

export interface FilterState {
  steps: FilterStep[];
  baseColor: string;
  previewText: string;
  presetName: string;
}

export interface Preset {
  name: string;
  description: string;
  steps: FilterStep[];
}

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

export function createFilterStep(type: ScalarFilterType, value: number): ScalarFilterStep;
export function createFilterStep(type: 'drop-shadow'): DropShadowFilterStep;
export function createFilterStep(type: 'url'): UrlFilterStep;
export function createFilterStep(type: FilterType, value?: number): FilterStep {
  const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (type === 'drop-shadow') {
    return { id, type, value: { offsetX: 2, offsetY: 2, blurRadius: 4, color: '#00000066' }, enabled: true };
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
];
