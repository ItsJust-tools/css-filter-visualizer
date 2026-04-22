'use client';

import { useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (readOnly) return;
    ref.current?.focus();
  }, [readOnly, ref]);

  return (
    <div ref={ref} className="tool-canvas" tabIndex={0}>
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
            className="tool-title-input"
          />
        )}
      </h1>
      <p className="tool-placeholder">
        Replace this with your tool&apos;s UI. Edit the files in <code>src/tool/</code> to get started.
      </p>
    </div>
  );
}
