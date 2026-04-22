'use client';

import type { ToolState } from '../types';

interface ToolSidebarProps {
  state: ToolState;
}

export function ToolSidebar(_props: ToolSidebarProps) {
  void _props;
  return (
    <div className="tool-sidebar">
      <p className="sidebar-hint">
        This is your tool sidebar. Add controls here in <code>src/tool/components/tool-sidebar.tsx</code>.
      </p>
    </div>
  );
}
