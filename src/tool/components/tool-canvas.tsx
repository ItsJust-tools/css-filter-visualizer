'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { buildFilterCss } from '../tool-definition';
import { previewTextColor } from '../lib/color-utils';
import type { FilterState } from '../types';

/** Default base color used as the initial state value. */
const DEFAULT_BASE_COLOR = '#6366f1';

interface ToolCanvasProps {
  state: FilterState;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  onBaseColorChange?: (color: string) => void;
  onPreviewTextChange?: (text: string) => void;
}

/**
 * Displays the live filtered preview, copyable CSS output,
 * and controls for background color and preview text.
 */
export function ToolCanvas({
  state,
  canvasRef,
  onBaseColorChange,
  onPreviewTextChange,
}: ToolCanvasProps) {
  const filterCss = buildFilterCss(state.steps);
  const [cssCopied, setCssCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCopyTimer = useCallback(() => {
    setCssCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCssCopied(false);
      copyTimerRef.current = null;
    }, 2000);
  }, []);

  // Clean up copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyCss = useCallback(async () => {
    setIsCopying(true);
    const cssText = `filter: ${filterCss || 'none'};`;
    try {
      await navigator.clipboard.writeText(cssText);
      startCopyTimer();
    } catch {
      // Clipboard API not available — fall back to text selection
      const el = document.querySelector('.filter-css-output code');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          startCopyTimer();
          setTimeout(() => {
            selection.removeAllRanges();
          }, 2000);
        }
      }
    } finally {
      setIsCopying(false);
    }
  }, [filterCss, startCopyTimer]);

  const textColor = previewTextColor(state.baseColor);

  return (
    <div
      ref={canvasRef}
      className="filter-canvas"
      role="application"
      aria-label="CSS Filter Preview"
    >
      {/* Screen reader status announcement */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {state.steps.length > 0
          ? `${state.steps.filter((s) => s.enabled).length} of ${state.steps.length} filters active`
          : 'No filters active'}
      </div>
      {/* Preview area */}
      <div className="filter-preview-section">
        <div
          className="filter-preview-box"
          style={{ backgroundColor: state.baseColor, filter: filterCss }}
        >
          <div className="filter-preview-text" style={{ color: textColor }}>
            {state.previewText}
          </div>
        </div>
        <div className="filter-css-output-row">
          <div className="filter-css-output" aria-label="CSS filter rule">
            <code>filter: {filterCss || 'none'};</code>
            {!filterCss && (
              <span
                className="filter-css-hint"
                aria-label="No active filters. Click a filter type in the sidebar to add one."
              >
                add a filter to begin
              </span>
            )}
          </div>
          <button
            type="button"
            className={`filter-copy-btn ${cssCopied ? 'filter-copy-btn--copied' : ''}`}
            onClick={handleCopyCss}
            aria-label={cssCopied ? 'CSS copied' : 'Copy CSS rule to clipboard'}
            aria-busy={isCopying || undefined}
            disabled={isCopying}
            title={cssCopied ? 'Copied!' : isCopying ? 'Copying…' : 'Copy to clipboard'}
          >
            {isCopying ? '…' : cssCopied ? 'Copied!' : 'Copy'}
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
            <button
              type="button"
              className="filter-color-reset-btn"
              onClick={() => onBaseColorChange?.(DEFAULT_BASE_COLOR)}
              aria-label="Reset background color to default"
              title={`Reset to ${DEFAULT_BASE_COLOR}`}
              disabled={state.baseColor === DEFAULT_BASE_COLOR}
            >
              ↩
            </button>
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

ToolCanvas.displayName = 'ToolCanvas';
