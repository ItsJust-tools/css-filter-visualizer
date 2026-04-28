'use client';

import type { ToolState } from '../types';

interface ToolSidebarProps {
  state: ToolState;
}

export function ToolSidebar({ state }: ToolSidebarProps) {
  return (
    <div className="tool-sidebar">
      <div className="sidebar-section">
        <h3>Current Tool</h3>
        <p>{state.title}</p>
      </div>
      <p className="sidebar-hint">
        This is your tool sidebar. Add controls here in{' '}
        <code>src/tool/components/tool-sidebar.tsx</code>.
      </p>
    </div>
  );
}
