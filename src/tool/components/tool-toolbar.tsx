'use client';

import type { ToolState } from '../types';

interface ToolToolbarProps {
  state: ToolState;
}

export function ToolToolbar(_props: ToolToolbarProps) {
  void _props;
  return (
    <div className="tool-toolbar-items">
      <span className="toolbar-hint">Edit src/tool/ to customize</span>
    </div>
  );
}
