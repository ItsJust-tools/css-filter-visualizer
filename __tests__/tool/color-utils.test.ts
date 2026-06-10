import { describe, it, expect } from 'vitest';
import { hexToRgb, hexLuminance, previewTextColor } from '../../src/tool/lib/color-utils';

describe('hexToRgb', () => {
  it('parses 6-digit hex with hash', () => {
    const result = hexToRgb('#ff0000');
    expect(result).toEqual({ r: 1, g: 0, b: 0 });
  });

  it('parses 6-digit hex without hash', () => {
    const result = hexToRgb('00ff00');
    expect(result).toEqual({ r: 0, g: 1, b: 0 });
  });

  it('parses 3-digit shorthand hex', () => {
    const result = hexToRgb('#f00');
    expect(result).toEqual({ r: 1, g: 0, b: 0 });
  });

  it('parses 4-digit hex with alpha (ignores alpha)', () => {
    const result = hexToRgb('#f00f');
    expect(result).toEqual({ r: 1, g: 0, b: 0 });
  });

  it('parses 8-digit hex (ignores alpha)', () => {
    const result = hexToRgb('#ff000080');
    expect(result).toEqual({ r: 1, g: 0, b: 0 });
  });

  it('returns null for invalid hex string', () => {
    expect(hexToRgb('not-a-color')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(hexToRgb('')).toBeNull();
  });

  it('handles mixed case hex', () => {
    const result = hexToRgb('#Ff8800');
    expect(result).toBeDefined();
    expect(result!.r).toBeCloseTo(1, 3);
    expect(result!.g).toBeCloseTo(0.533, 2);
    expect(result!.b).toBe(0);
  });

  it('parses the default base color correctly', () => {
    const result = hexToRgb('#6366f1');
    expect(result).toBeDefined();
    expect(result!.r).toBeCloseTo(0.388, 2);
    expect(result!.g).toBeCloseTo(0.4, 2);
    expect(result!.b).toBeCloseTo(0.945, 3);
  });
});

describe('hexLuminance', () => {
  it('returns 0.5 for invalid input', () => {
    expect(hexLuminance('garbage')).toBe(0.5);
  });

  it('returns ~0 for pure black', () => {
    const lum = hexLuminance('#000000');
    expect(lum).toBeLessThan(0.01);
  });

  it('returns ~1 for pure white', () => {
    const lum = hexLuminance('#ffffff');
    expect(lum).toBeGreaterThan(0.99);
  });

  it('returns ~0.5 for middle-gray', () => {
    const lum = hexLuminance('#808080');
    expect(lum).toBeGreaterThan(0.2);
    expect(lum).toBeLessThan(0.3);
  });

  it('returns a value between 0 and 1 for any valid color', () => {
    expect(hexLuminance('#ff0000')).toBeGreaterThan(0);
    expect(hexLuminance('#ff0000')).toBeLessThan(1);
    expect(hexLuminance('#00ff00')).toBeGreaterThan(0);
    expect(hexLuminance('#00ff00')).toBeLessThan(1);
    expect(hexLuminance('#0000ff')).toBeGreaterThan(0);
    expect(hexLuminance('#0000ff')).toBeLessThan(1);
  });
});

describe('previewTextColor', () => {
  it('returns light text for dark background', () => {
    expect(previewTextColor('#000000')).toBe('#ffffff');
    expect(previewTextColor('#1a1a2e')).toBe('#ffffff');
    expect(previewTextColor('#333333')).toBe('#ffffff');
  });

  it('returns dark text for light background', () => {
    expect(previewTextColor('#ffffff')).toBe('#1a1a2e');
    expect(previewTextColor('#f0f0f0')).toBe('#1a1a2e');
    expect(previewTextColor('#ffff00')).toBe('#1a1a2e');
  });

  it('returns light text for the default base color (#6366f1)', () => {
    // #6366f1 has luminance < 0.5 (it's a medium purple-blue)
    expect(previewTextColor('#6366f1')).toBe('#ffffff');
  });
});
