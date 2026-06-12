/**
 * Color utility functions for the CSS Filter Visualizer.
 */

/**
 * Parse a hex color string to its RGB components.
 * Supports 3-, 4-, 6-, and 8-digit hex (with or without #).
 * Returns normalized RGB values between 0 and 1.
 *
 * @param hex - Hex color string (e.g. "#ff0000", "f00", "#ff000080")
 * @returns RGB object with values 0-1, or null if parsing fails
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) return null;

  let full: string;
  if (clean.length === 3) {
    const c0 = clean[0];
    const c1 = clean[1];
    const c2 = clean[2];
    if (c0 === undefined || c1 === undefined || c2 === undefined) return null;
    full = c0.repeat(2) + c1.repeat(2) + c2.repeat(2);
  } else if (clean.length === 4) {
    const c0 = clean[0];
    const c1 = clean[1];
    const c2 = clean[2];
    const c3 = clean[3];
    if (c0 === undefined || c1 === undefined || c2 === undefined || c3 === undefined) return null;
    full = c0.repeat(2) + c1.repeat(2) + c2.repeat(2) + c3.repeat(2);
  } else if (clean.length === 6 || clean.length === 8) {
    full = clean.slice(0, 6);
  } else {
    return null;
  }

  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
}

/**
 * Calculate relative luminance of a hex color using the sRGB luminance formula.
 * Returns a value between 0 (dark) and 1 (light).
 * Used to determine optimal text contrast color against a given background.
 *
 * For 8-digit hex strings, only the first 6 characters are used (alpha is stripped).
 *
 * @param hex - Hex color string (3, 4, 6, or 8 digits, with or without #)
 * @returns Relative luminance value between 0 and 1, or 0 on failure
 */
export function hexLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0; // fallback for invalid input — 0 is pure black luminance
  return srgbLuminance(rgb.r, rgb.g, rgb.b);
}

/**
 * Compute the WCAG 2.1 contrast ratio between two sRGB luminance values.
 * Ratio ranges from 1:1 (identical luminance) to 21:1 (black vs white).
 *
 * @param l1 - Relative luminance of the lighter color
 * @param l2 - Relative luminance of the darker color
 * @returns Contrast ratio (≥ 1)
 */
export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Compute relative sRGB luminance for a single RGB channel value (0-1).
 * Uses the linearization formula from WCAG 2.1.
 */
function linearize(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Compute relative sRGB luminance from normalized RGB components (0-1 each). */
function srgbLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Luminance of pure white (#ffffff). */
const WHITE_LUMINANCE = srgbLuminance(1, 1, 1);

/** Luminance of pure black (#000000). */
const BLACK_LUMINANCE = srgbLuminance(0, 0, 0);

/**
 * Determines the optimal text color for readability against a given background.
 * Evaluates both candidates (a themed white and a themed dark blue-grey) against
 * the background and picks the one with the higher WCAG 2.1 contrast ratio. This
 * is more accurate than a simple luminance threshold when the background
 * is in the "middle" range where both light and dark could work.
 *
 * @param baseColor - Background hex color
 * @returns `#ffffff` for light text on dark backgrounds, or `#1a1a2e` for dark
 * text on light backgrounds
 */
export function previewTextColor(baseColor: string): string {
  const bgLum = hexLuminance(baseColor);

  const whiteRatio = contrastRatio(WHITE_LUMINANCE, bgLum);
  const blackRatio = contrastRatio(bgLum, BLACK_LUMINANCE);

  return whiteRatio >= blackRatio ? '#ffffff' : '#1a1a2e';
}
