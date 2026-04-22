'use client';

import { useRef, useState } from 'react';
import { ToolShell, useTool, ImportExport } from '@itsjust/core';
import { toolConfig, myTool, ToolCanvas, ToolToolbar, ToolSidebar } from '@/tool';
import { registerToolExporters } from '@/tool/exporters';

registerToolExporters();

export default function ToolClient() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tool = useTool(myTool, canvasRef);
  const [sidebarOpen, setSidebarOpen] = useState(toolConfig.features.sidebar);

  return (
    <ToolShell
      config={toolConfig}
      actions={tool.toolbarActions}
      sidebarOpen={sidebarOpen}
      onSidebarChange={setSidebarOpen}
    >
      <ToolShell.Toolbar>
        <ToolToolbar state={tool.state.data} />
        <ImportExport
          formats={tool.supportedFormats}
          onExport={tool.handleExport}
          onImport={tool.importFromFile}
          isImporting={tool.isImporting}
        />
      </ToolShell.Toolbar>
      <ToolShell.Body>
        <ToolShell.Sidebar>
          <ToolSidebar state={tool.state.data} />
        </ToolShell.Sidebar>
        <ToolShell.Canvas>
          <ToolCanvas
            canvasRef={canvasRef}
            state={tool.state.data}
            onTitleChange={(title) => tool.state.setData((prev) => ({ ...prev, title }))}
          />
        </ToolShell.Canvas>
      </ToolShell.Body>
      <ToolShell.StatusBar>
        <span className={tool.state.isDirty ? 'status-unsaved' : 'status-saved'}>
          {tool.state.isDirty ? (
            <><span className="status-saving-dot" />Unsaved</>
          ) : tool.state.lastSaved ? (
            <>Saved {tool.state.lastSaved.toLocaleTimeString()}</>
          ) : 'Ready'}
        </span>
        <span>{tool.state.data.title}</span>
      </ToolShell.StatusBar>
    </ToolShell>
  );
}
