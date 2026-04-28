'use client';

import type { ToolState } from '../types';

interface ToolToolbarProps {
  state: ToolState;
}

export function ToolToolbar({ state }: ToolToolbarProps) {
  return (
    <div className="tool-toolbar-items">
      <span className="toolbar-title-preview">{state.title}</span>
      <span className="toolbar-hint">Edit src/tool/ to customize</span>
    </div>
  );
}
