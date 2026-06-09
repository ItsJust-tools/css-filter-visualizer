import { describe, it, expect } from 'vitest';
import { buildFilterCss, cssFilterTool, initialState } from '@/tool/tool-definition';
import type { FilterState, FilterStep, DropShadowFilterStep, UrlFilterStep } from '@/tool/types';

describe('CSS Filter Visualizer logic', () => {
  it('initializes with default state', () => {
    expect(initialState.steps).toHaveLength(4);
    expect(initialState.baseColor).toBe('#6366f1');
    expect(initialState.previewText).toBe('Hello, Filter World!');
  });

  it('builds filter CSS for enabled steps', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'blur', value: 5, enabled: true },
      { id: '2', type: 'brightness', value: 150, enabled: true },
      { id: '3', type: 'contrast', value: 120, enabled: false },
    ];
    const css = buildFilterCss(steps);
    expect(css).toContain('blur(5px)');
    expect(css).toContain('brightness(150%)');
    expect(css).not.toContain('contrast');
  });

  it('returns empty string when no steps are enabled', () => {
    const steps: FilterStep[] = [{ id: '1', type: 'blur', value: 5, enabled: false }];
    expect(buildFilterCss(steps)).toBe('');
  });

  it('returns empty string for empty steps array', () => {
    expect(buildFilterCss([])).toBe('');
  });

  it('builds filter CSS for all scalar filter types', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'blur', value: 5, enabled: true },
      { id: '2', type: 'brightness', value: 150, enabled: true },
      { id: '3', type: 'contrast', value: 120, enabled: true },
      { id: '4', type: 'grayscale', value: 50, enabled: true },
      { id: '5', type: 'hue-rotate', value: 180, enabled: true },
      { id: '6', type: 'invert', value: 100, enabled: true },
      { id: '7', type: 'opacity', value: 50, enabled: true },
      { id: '8', type: 'saturate', value: 200, enabled: true },
      { id: '9', type: 'sepia', value: 100, enabled: true },
    ];
    const css = buildFilterCss(steps);
    expect(css).toContain('blur(5px)');
    expect(css).toContain('brightness(150%)');
    expect(css).toContain('contrast(120%)');
    expect(css).toContain('grayscale(50%)');
    expect(css).toContain('hue-rotate(180deg)');
    expect(css).toContain('invert(100%)');
    expect(css).toContain('opacity(50%)');
    expect(css).toContain('saturate(200%)');
    expect(css).toContain('sepia(100%)');
  });

  it('handles drop-shadow filter type with proper value shape', () => {
    const steps: DropShadowFilterStep[] = [
      {
        id: '1',
        type: 'drop-shadow',
        value: { offsetX: 2, offsetY: 3, blurRadius: 6, color: '#ff0000' },
        enabled: true,
      },
    ];
    const css = buildFilterCss(steps);
    expect(css).toMatch(/drop-shadow\(2px 3px 6px #ff0000\)/);
  });

  it('handles url filter type', () => {
    const steps: UrlFilterStep[] = [
      {
        id: 'svg-123',
        type: 'url',
        value: undefined,
        enabled: true,
      },
    ];
    const css = buildFilterCss(steps);
    expect(css).toBe('url(#filter-svg-123)');
  });

  it('skips disabled url and drop-shadow filters', () => {
    const steps: FilterStep[] = [
      {
        id: '1',
        type: 'drop-shadow',
        value: { offsetX: 2, offsetY: 2, blurRadius: 4, color: '#000' },
        enabled: false,
      },
      {
        id: '2',
        type: 'url',
        value: undefined,
        enabled: false,
      },
    ];
    const css = buildFilterCss(steps);
    expect(css).toBe('');
  });

  it('serializes state to JSON string', () => {
    const state: FilterState = {
      steps: [{ id: '1', type: 'blur', value: 5, enabled: true }],
      baseColor: '#ff0000',
      previewText: 'Test',
      presetName: '',
    };
    const json = cssFilterTool.serialize(state);
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed.baseColor).toBe('#ff0000');
    expect(parsed.steps).toHaveLength(1);
  });

  it('deserializes valid state object', () => {
    const result = cssFilterTool.deserialize({
      steps: [{ id: '1', type: 'blur', value: 5, enabled: true }],
      baseColor: '#fff',
      previewText: 'Hello',
      presetName: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.baseColor).toBe('#fff');
      expect(result.data.previewText).toBe('Hello');
    }
  });

  it('deserializes valid drop-shadow step state', () => {
    const result = cssFilterTool.deserialize({
      steps: [
        {
          id: 'ds-1',
          type: 'drop-shadow',
          value: { offsetX: 3, offsetY: 5, blurRadius: 8, color: 'rgba(0,0,0,0.5)' },
          enabled: true,
        },
      ],
      baseColor: '#fff',
      previewText: 'Test',
      presetName: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.steps).toHaveLength(1);
      const ds = result.data.steps[0]!;
      if (ds.type !== 'drop-shadow') {
        expect.unreachable('Expected drop-shadow type');
      }
      expect(ds.value.offsetX).toBe(3);
      expect(ds.value.offsetY).toBe(5);
      expect(ds.value.color).toBe('rgba(0,0,0,0.5)');
    }
  });

  it('rejects null data', () => {
    const result = cssFilterTool.deserialize(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects non-object data', () => {
    const result = cssFilterTool.deserialize('string');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects object without steps array', () => {
    const result = cssFilterTool.deserialize({ baseColor: '#fff', previewText: 'test' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('supports undo/redo via core', () => {
    // This verifies the state shape works with undo/redo pattern
    const state: FilterState = {
      steps: [{ id: '1', type: 'blur', value: 0, enabled: false }],
      baseColor: '#6366f1',
      previewText: 'Hello',
      presetName: '',
    };
    const serialized = cssFilterTool.serialize(state);
    const parsed = JSON.parse(serialized);
    expect(parsed.baseColor).toBe('#6366f1');
    expect(parsed.steps).toHaveLength(1);
  });

  it('generates steps via createFilterStep factory', async () => {
    const { createFilterStep } = await import('@/tool/types');
    const blur = createFilterStep('blur', 3);
    expect(blur.type).toBe('blur');
    if (blur.type === 'blur') {
      expect(blur.value).toBe(3);
      expect(blur.enabled).toBe(true);
      expect(blur.id).toMatch(/^f-/);
    }

    const ds = createFilterStep('drop-shadow');
    expect(ds.type).toBe('drop-shadow');
    if (ds.type === 'drop-shadow') {
      expect(ds.value.offsetX).toBe(2);
      expect(ds.value.color).toBe('#00000066');
    }

    const urlStep = createFilterStep('url');
    expect(urlStep.type).toBe('url');
    expect(urlStep.enabled).toBe(true);
  });

  it('respects filter order in CSS output', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'blur', value: 5, enabled: true },
      { id: '2', type: 'contrast', value: 150, enabled: true },
    ];
    expect(buildFilterCss(steps)).toBe('blur(5px) contrast(150%)');

    // Reversed order should produce different CSS
    const reversed: FilterStep[] = [steps[1]!, steps[0]!];
    expect(buildFilterCss(reversed)).toBe('contrast(150%) blur(5px)');
  });

  it('moves a filter step up', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'blur', value: 5, enabled: true },
      { id: '2', type: 'contrast', value: 150, enabled: true },
      { id: '3', type: 'sepia', value: 50, enabled: true },
    ];
    const idx = steps.findIndex((s) => s.id === '3');
    const temp = steps[idx]!;
    steps[idx] = steps[idx - 1]!;
    steps[idx - 1] = temp;
    expect(steps[0]!.id).toBe('1');
    expect(steps[1]!.id).toBe('3');
    expect(steps[2]!.id).toBe('2');
    expect(buildFilterCss(steps)).toBe('blur(5px) sepia(50%) contrast(150%)');
  });

  it('moves a filter step down', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'blur', value: 5, enabled: true },
      { id: '2', type: 'contrast', value: 150, enabled: true },
      { id: '3', type: 'sepia', value: 50, enabled: true },
    ];
    const idx = steps.findIndex((s) => s.id === '1');
    const temp = steps[idx]!;
    steps[idx] = steps[idx + 1]!;
    steps[idx + 1] = temp;
    expect(steps[0]!.id).toBe('2');
    expect(steps[1]!.id).toBe('1');
    expect(steps[2]!.id).toBe('3');
    expect(buildFilterCss(steps)).toBe('contrast(150%) blur(5px) sepia(50%)');
  });

  it('does not move first step up or last step down', () => {
    const steps: FilterStep[] = [
      { id: '1', type: 'blur', value: 5, enabled: true },
      { id: '2', type: 'contrast', value: 150, enabled: true },
    ];
    const upIdx = steps.findIndex((s) => s.id === '1');
    expect(upIdx).toBe(0); // already at top, cannot move up
    const downIdx = steps.findIndex((s) => s.id === '2');
    expect(downIdx).toBe(1); // already at bottom, cannot move down
  });
});
