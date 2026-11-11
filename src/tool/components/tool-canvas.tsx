'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { copyToClipboard } from '@itsjust/core';
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
  onCustomImageChange?: (dataUrl: string | null, name?: string) => void;
}

/** Allowed image MIME types for custom uploads. */
const ALLOWED_IMAGE_TYPES = /^image\/(jpeg|png|svg\+xml|webp|gif|avif)$/;
/** Maximum size for a custom preview image (5 MB). */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Reads a File as a data URL, resolving on success and rejecting on failure.
 * Validates the type and size before reading.
 */
export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_IMAGE_TYPES.test(file.type)) {
      reject(new Error('Unsupported file type. Use JPEG, PNG, SVG, WebP, GIF, or AVIF.'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(
        new Error(`File is too large (max ${(MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(0)} MB).`)
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsDataURL(file);
  });
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
  onCustomImageChange,
}: ToolCanvasProps) {
  const filterCss = buildFilterCss(state.steps);
  const [cssCopied, setCssCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      const copied = await copyToClipboard(cssText);
      if (copied) {
        startCopyTimer();
      } else {
        // Clipboard write failed — fall back to text selection
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
    } finally {
      setIsCopying(false);
    }
  }, [filterCss, startCopyTimer]);

  const textColor = previewTextColor(state.baseColor);

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      setImageError(null);
      try {
        const dataUrl = await readImageAsDataUrl(file);
        onCustomImageChange?.(dataUrl, file.name);
      } catch (error) {
        setImageError(error instanceof Error ? error.message : 'Failed to load image.');
      }
    },
    [onCustomImageChange]
  );

  const handleRemoveImage = useCallback(() => {
    setImageError(null);
    onCustomImageChange?.(null);
  }, [onCustomImageChange]);

  const hasImage = Boolean(state.customImage);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

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
          className={`filter-image-zone ${isDragOver ? 'filter-image-zone--dragover' : ''} ${hasImage ? 'filter-image-zone--active' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          role="region"
          aria-label="Custom image: upload or drag and drop to preview"
        >
          {state.customImage ? (
            <div
              className="filter-preview-box"
              style={{
                backgroundImage: `url(${state.customImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: filterCss,
              }}
              aria-label={`Preview with custom image${state.customImageName ? ` (${state.customImageName})` : ''}`}
            >
              <div
                className="filter-preview-text filter-preview-text--image"
                style={{ color: textColor }}
              >
                {state.previewText}
              </div>
            </div>
          ) : (
            <div
              className="filter-preview-box"
              style={{ backgroundColor: state.baseColor, filter: filterCss }}
            >
              <div className="filter-preview-text" style={{ color: textColor }}>
                {state.previewText}
              </div>
            </div>
          )}
          <div className="filter-image-actions">
            <input
              ref={fileInputRef}
              id="custom-image-input"
              type="file"
              accept="image/jpeg,image/png,image/svg+xml,image/webp,image/gif,image/avif"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
              className="filter-image-input"
            />
            <button
              type="button"
              className="filter-image-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label={hasImage ? 'Replace custom image' : 'Upload custom image'}
              title={hasImage ? 'Replace image' : 'Upload image'}
            >
              📁 {hasImage ? 'Replace Image' : 'Upload Image'}
            </button>
            {hasImage && (
              <button
                type="button"
                className="filter-image-btn filter-image-btn--remove"
                onClick={handleRemoveImage}
                aria-label="Remove custom image"
                title="Remove image"
              >
                ✕ Remove
              </button>
            )}
            {!hasImage && (
              <span className="filter-image-hint">or drag &amp; drop an image here</span>
            )}
          </div>
          {imageError && (
            <div role="alert" className="filter-image-error">
              {imageError}
            </div>
          )}
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
