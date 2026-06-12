import { describe, it, expect } from 'vitest';
import { hexToRgb, hexLuminance, previewTextColor } from '@/tool/lib/color-utils';
import { generateId } from '@/tool/lib/utils';

describe('color-utils', () => {
  describe('hexToRgb', () => {
    it('parses 6-digit hex with hash', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 1, g: 0, b: 0 });
    });

    it('parses 6-digit hex without hash', () => {
      expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 1, b: 0 });
    });

    it('parses 3-digit hex', () => {
      expect(hexToRgb('#f00')).toEqual({ r: 1, g: 0, b: 0 });
      expect(hexToRgb('#0f0')).toEqual({ r: 0, g: 1, b: 0 });
      expect(hexToRgb('#fff')).toEqual({ r: 1, g: 1, b: 1 });
    });

    it('parses 4-digit hex (with alpha, reads first 3)', () => {
      const result = hexToRgb('#f00f');
      expect(result!.r).toBe(1);
      expect(result!.g).toBe(0);
      expect(result!.b).toBe(0);
    });

    it('parses 8-digit hex (with alpha, reads first 6)', () => {
      const result = hexToRgb('#ff000080');
      expect(result).toEqual({ r: 1, g: 0, b: 0 });
    });

    it('parses lowercase hex', () => {
      expect(hexToRgb('#aabbcc')).toEqual({
        r: 0xaa / 255,
        g: 0xbb / 255,
        b: 0xcc / 255,
      });
    });

    it('parses uppercase hex', () => {
      expect(hexToRgb('#AABBCC')).toEqual({
        r: 0xaa / 255,
        g: 0xbb / 255,
        b: 0xcc / 255,
      });
    });

    it('returns null for empty string', () => {
      expect(hexToRgb('')).toBeNull();
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('#xyz')).toBeNull();
      expect(hexToRgb('not-a-color')).toBeNull();
      expect(hexToRgb('#12')).toBeNull();
    });

    it('returns null for 5-digit hex', () => {
      expect(hexToRgb('#12345')).toBeNull();
    });

    it('handles hex with leading/trailing whitespace', () => {
      expect(hexToRgb('  #ff0000  ')).toEqual({ r: 1, g: 0, b: 0 });
    });
  });

  describe('hexLuminance', () => {
    it('returns 0 for pure black', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      const lum = hexLuminance('#000000');
      expect(lum).toBeCloseTo(0, 5);
    });

    it('returns 1 for pure white', () => {
      const lum = hexLuminance('#ffffff');
      expect(lum).toBeCloseTo(1, 5);
    });

    it('returns ~0.2126 for pure red', () => {
      const lum = hexLuminance('#ff0000');
      expect(lum).toBeCloseTo(0.2126, 4);
    });

    it('returns ~0.7152 for pure green', () => {
      const lum = hexLuminance('#00ff00');
      expect(lum).toBeCloseTo(0.7152, 4);
    });

    it('returns ~0.0722 for pure blue', () => {
      const lum = hexLuminance('#0000ff');
      expect(lum).toBeCloseTo(0.0722, 4);
    });

    it('returns 0.5 fallback for invalid hex', () => {
      expect(hexLuminance('invalid')).toBe(0.5);
      expect(hexLuminance('')).toBe(0.5);
    });

    it('calculates luminance for a medium gray', () => {
      // #808080 — medium gray
      const lum = hexLuminance('#808080');
      // Linearized sRGB: (0.5/12.92) ≈ 0.0387 for each channel (0.5 > 0.03928? Yes)
      // Actually 0.5 > 0.03928, so: ((0.5 + 0.055) / 1.055)^2.4 ≈ 0.214
      // L = 0.2126*0.214 + 0.7152*0.214 + 0.0722*0.214 = 0.214
      expect(lum).toBeGreaterThan(0.2);
      expect(lum).toBeLessThan(0.22);
    });
  });

  describe('previewTextColor', () => {
    it('returns dark text for light background', () => {
      expect(previewTextColor('#ffffff')).toBe('#1a1a2e');
      expect(previewTextColor('#ffff00')).toBe('#1a1a2e');
    });

    it('returns white text for dark background', () => {
      expect(previewTextColor('#000000')).toBe('#ffffff');
      expect(previewTextColor('#333333')).toBe('#ffffff');
    });

    it('returns dark text for invalid hex (0.5 luminance — black has better WCAG contrast)', () => {
      expect(previewTextColor('garbage')).toBe('#1a1a2e');
    });
  });
});

describe('utils', () => {
  describe('generateId', () => {
    it('returns a string starting with f-', () => {
      const id = generateId();
      expect(id).toMatch(/^f-/);
    });

    it('returns unique IDs on successive calls', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });

    it('is a valid UUID v4 prefixed with f-', () => {
      const id = generateId();
      expect(id).toMatch(/^f-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('produces consistent length across calls', () => {
      const ids = Array.from({ length: 50 }, () => generateId());
      ids.forEach((id) => {
        expect(id.length).toBe(38); // "f-" + 36-char UUID
      });
    });
  });
});
