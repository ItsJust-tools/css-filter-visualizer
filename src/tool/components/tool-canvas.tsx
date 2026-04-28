'use client';

import { useRef } from 'react';
import type { ToolState } from '../types';

interface ToolCanvasProps {
  state: ToolState;
  readOnly?: boolean;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

export function ToolCanvas({ canvasRef }: ToolCanvasProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = canvasRef ?? localRef;

  return (
    <div ref={ref} className="tool-canvas" role="application" aria-label="Tool canvas" />
  );
}
