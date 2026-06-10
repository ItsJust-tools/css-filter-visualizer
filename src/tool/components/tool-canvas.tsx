'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { buildFilterCss } from '../tool-definition';
import { previewTextColor } from '../lib/color-utils';
import type { FilterState } from '../types';

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
    }
  }, [filterCss, startCopyTimer]);

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

ToolCanvas.displayName = 'ToolCanvas';
