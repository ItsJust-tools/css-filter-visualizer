'use client';

import { useState, useCallback } from 'react';
import { buildFilterCss } from '../tool-definition';
import type { FilterState } from '../types';

/**
 * Parse a hex color string to its RGB components.
 * Supports 3-, 4-, 6-, and 8-digit hex (with or without #).
 * Returns normalized RGB values between 0 and 1.
 *
 * @param hex - Hex color string (e.g. "#ff0000", "f00", "#ff000080")
 * @returns RGB object with values 0-1, or null if parsing fails
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) return null;

  let full: string;
  if (clean.length === 3) {
    full = clean[0]!.repeat(2) + clean[1]!.repeat(2) + clean[2]!.repeat(2);
  } else if (clean.length === 4) {
    full = clean[0]!.repeat(2) + clean[1]!.repeat(2) + clean[2]!.repeat(2) + clean[3]!.repeat(2);
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
 * @param hex - Hex color string
 * @returns Relative luminance value between 0 and 1, or 0.5 on failure
 */
function hexLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5; // fallback for invalid input
  const linearize = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b);
}

/**
 * Determine the optimal text color (black or white) for readability
 * against the given background color using WCAG-style luminance contrast.
 *
 * @param baseColor - Background hex color
 * @returns Black or white hex color string
 */
function previewTextColor(baseColor: string): string {
  return hexLuminance(baseColor) > 0.5 ? '#1a1a2e' : '#ffffff';
}

interface ToolCanvasProps {
  state: FilterState;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onBaseColorChange?: (color: string) => void;
  onPreviewTextChange?: (text: string) => void;
}

export function ToolCanvas({
  state,
  canvasRef,
  onBaseColorChange,
  onPreviewTextChange,
}: ToolCanvasProps) {
  const filterCss = buildFilterCss(state.steps);
  const [cssCopied, setCssCopied] = useState(false);

  const handleCopyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`filter: ${filterCss || 'none'};`);
      setCssCopied(true);
      setTimeout(() => setCssCopied(false), 2000);
    } catch {
      // Clipboard API not available — fall back to selection
    }
  }, [filterCss]);

  return (
    <div
      ref={canvasRef}
      className="filter-canvas"
      role="application"
      aria-label="CSS Filter Preview"
    >
      {/* Preview area */}
      <div className="filter-preview-section">
        <div
          className="filter-preview-box"
          style={{ backgroundColor: state.baseColor, filter: filterCss }}
        >
          <div className="filter-preview-text" style={{ color: previewTextColor(state.baseColor) }}>
            {state.previewText}
          </div>
        </div>
        <div className="filter-css-output-row">
          <div className="filter-css-output" aria-label="CSS filter rule">
            <code>filter: {filterCss || 'none'};</code>
          </div>
          <button
            type="button"
            className={`filter-copy-btn ${cssCopied ? 'filter-copy-btn--copied' : ''}`}
            onClick={handleCopyCss}
            aria-label={cssCopied ? 'CSS copied' : 'Copy CSS rule to clipboard'}
            title={cssCopied ? 'Copied!' : 'Copy to clipboard'}
          >
            {cssCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="filter-controls">
        <div className="filter-control-group">
          <label htmlFor="base-color" className="filter-label">
            Background Color
          </label>
          <div className="filter-color-row">
            <input
              id="base-color"
              type="color"
              value={state.baseColor}
              onChange={(e) => onBaseColorChange?.(e.target.value)}
              className="filter-color-picker"
              aria-label="Background color"
            />
            <input
              type="text"
              value={state.baseColor}
              onChange={(e) => onBaseColorChange?.(e.target.value)}
              className="filter-color-input"
              aria-label="Color hex value"
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="filter-control-group">
          <label htmlFor="preview-text" className="filter-label">
            Preview Text
          </label>
          <input
            id="preview-text"
            type="text"
            value={state.previewText}
            onChange={(e) => onPreviewTextChange?.(e.target.value)}
            className="filter-text-input"
            aria-label="Preview text"
            placeholder="Type something..."
          />
        </div>
      </div>
    </div>
  );
}
