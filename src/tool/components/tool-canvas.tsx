'use client';

import { useRef } from 'react';
import type { ToolState } from '../types';

interface ToolCanvasProps {
  state: ToolState;
  onTitleChange?: (title: string) => void;
  readOnly?: boolean;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

export function ToolCanvas({ state, onTitleChange, readOnly, canvasRef }: ToolCanvasProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = canvasRef ?? localRef;

  // Note: auto-focus removed to comply with WCAG 2.4.3 (Focus Order).
  // The canvas receives focus naturally via tab navigation when needed.

  return (
    <div ref={ref} className="tool-canvas" role="application" aria-label="Tool canvas">
      <h1 className="tool-title">
        {readOnly ? (
          state.title
        ) : (
          <input
            type="text"
            value={state.title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Enter tool name..."
            aria-label="Tool name"
            aria-describedby="tool-canvas-description"
            className="tool-title-input"
          />
        )}
      </h1>
      <p id="tool-canvas-description" className="tool-placeholder">
        Replace this with your tool&apos;s UI. Edit the files in <code>src/tool/</code> to get started.
      </p>
    </div>
  );
}
