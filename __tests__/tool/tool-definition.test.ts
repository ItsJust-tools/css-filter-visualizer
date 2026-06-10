import { describe, it, expect } from 'vitest';
import { buildFilterCss, initialState } from '../../src/tool/tool-definition';
import { createFilterStep } from '../../src/tool/types';
import type { FilterStep } from '../../src/tool/types';

describe('buildFilterCss', () => {
  it('returns empty string when no enabled steps exist', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'blur', value: 5, enabled: false },
    ];
    expect(buildFilterCss(steps)).toBe('');
  });

  it('returns "none" string when empty array is passed', () => {
    expect(buildFilterCss([])).toBe('');
  });

  it('builds a single blur filter', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'blur', value: 5, enabled: true },
    ];
    expect(buildFilterCss(steps)).toBe('blur(5px)');
  });

  it('builds a single percentage-based filter', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'brightness', value: 150, enabled: true },
    ];
    expect(buildFilterCss(steps)).toBe('brightness(150%)');
  });

  it('builds a hue-rotate filter with deg unit', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'hue-rotate', value: 180, enabled: true },
    ];
    expect(buildFilterCss(steps)).toBe('hue-rotate(180deg)');
  });

  it('chains multiple filter types', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'contrast', value: 140, enabled: true },
      { id: '2', type: 'brightness', value: 110, enabled: true },
      { id: '3', type: 'saturate', value: 180, enabled: true },
    ];
    expect(buildFilterCss(steps)).toBe('contrast(140%) brightness(110%) saturate(180%)');
  });

  it('excludes disabled filters from the CSS', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'contrast', value: 140, enabled: true },
      { id: '2', type: 'brightness', value: 110, enabled: false },
      { id: '3', type: 'saturate', value: 180, enabled: true },
    ];
    expect(buildFilterCss(steps)).toBe('contrast(140%) saturate(180%)');
  });

  it('builds drop-shadow filter with all sub-properties', () => {
    const steps: FilterStep[] = [
      {
        id: '1',
        type: 'drop-shadow',
        value: { offsetX: 2, offsetY: 4, blurRadius: 8, color: '#00000066' },
        enabled: true,
      },
    ];
    expect(buildFilterCss(steps)).toBe('drop-shadow(2px 4px 8px #00000066)');
  });

  it('builds drop-shadow with negative offsets', () => {
    const steps: FilterStep[] = [
      {
        id: '1',
        type: 'drop-shadow',
        value: { offsetX: -2, offsetY: -4, blurRadius: 6, color: '#ff0000' },
        enabled: true,
      },
    ];
    expect(buildFilterCss(steps)).toBe('drop-shadow(-2px -4px 6px #ff0000)');
  });

  it('builds url filter reference', () => {
    const steps: FilterStep[] = [
      { id: 'abc123', type: 'url', value: undefined, enabled: true },
    ];
    expect(buildFilterCss(steps)).toBe('url(#filter-abc123)');
  });

  it('combines different filter types correctly', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'blur', value: 4, enabled: true },
      {
        id: '2',
        type: 'drop-shadow',
        value: { offsetX: 0, offsetY: 4, blurRadius: 12, color: '#00000033' },
        enabled: true,
      },
      { id: '3', type: 'saturate', value: 80, enabled: true },
    ];
    expect(buildFilterCss(steps)).toBe(
      'blur(4px) drop-shadow(0px 4px 12px #00000033) saturate(80%)'
    );
  });

  it('handles all supported scalar filter types', () => {
    const scalarTypes = [
      'blur', 'brightness', 'contrast', 'grayscale',
      'hue-rotate', 'invert', 'opacity', 'saturate', 'sepia',
    ] as const;

    for (const type of scalarTypes) {
      const steps: FilterStep[] = [
        { id: '1', type, value: 50, enabled: true },
      ];
      const css = buildFilterCss(steps);
      expect(css).toContain(type);
      expect(css).toContain('50');
    }
  });

  it('uses px for blur', () => {
    const steps: FilterStep[] = [{ id: '1', type: 'blur', value: 10, enabled: true }];
    expect(buildFilterCss(steps)).toContain('px');
  });

  it('uses deg for hue-rotate', () => {
    const steps: FilterStep[] = [{ id: '1', type: 'hue-rotate', value: 90, enabled: true }];
    expect(buildFilterCss(steps)).toContain('deg');
  });

  it('uses % for brightness, contrast, grayscale, invert, opacity, saturate, sepia', () => {
    const percentTypes = ['brightness', 'contrast', 'grayscale', 'invert', 'opacity', 'saturate', 'sepia'] as const;
    for (const type of percentTypes) {
      const steps: FilterStep[] = [{ id: '1', type, value: 75, enabled: true }];
      expect(buildFilterCss(steps)).toContain('%');
    }
  });
});

describe('initialState', () => {
  it('has default structure with steps, baseColor, previewText', () => {
    expect(initialState).toHaveProperty('steps');
    expect(initialState).toHaveProperty('baseColor');
    expect(initialState).toHaveProperty('previewText');
    expect(initialState).toHaveProperty('presetName');
  });

  it('has initial default filters', () => {
    expect(initialState.steps).toHaveLength(4);
    expect(initialState.steps[0]?.type).toBe('blur');
    expect(initialState.steps[1]?.type).toBe('brightness');
    expect(initialState.steps[2]?.type).toBe('contrast');
    expect(initialState.steps[3]?.type).toBe('saturate');
  });

  it('has a valid base color', () => {
    expect(initialState.baseColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('has a non-empty preview text', () => {
    expect(initialState.previewText.length).toBeGreaterThan(0);
  });
});

describe('createFilterStep', () => {
  it('creates a scalar filter step with provided value', () => {
    const step = createFilterStep('blur', 10);
    expect(step.type).toBe('blur');
    expect(step.value).toBe(10);
    expect(step.enabled).toBe(true);
    expect(step.id).toMatch(/^f-/);
  });

  it('creates a drop-shadow step with defaults', () => {
    const step = createFilterStep('drop-shadow');
    expect(step.type).toBe('drop-shadow');
    expect(step.value).toEqual({
      offsetX: 2,
      offsetY: 2,
      blurRadius: 4,
      color: '#00000066',
    });
    expect(step.enabled).toBe(true);
  });

  it('creates a url filter step', () => {
    const step = createFilterStep('url');
    expect(step.type).toBe('url');
    expect(step.value).toBeUndefined();
    expect(step.enabled).toBe(true);
  });

  it('generates unique ids for each call', () => {
    const step1 = createFilterStep('blur', 5);
    const step2 = createFilterStep('blur', 10);
    expect(step1.id).not.toBe(step2.id);
  });
});
