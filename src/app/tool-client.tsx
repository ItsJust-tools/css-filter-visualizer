'use client';

import { useRef, useState } from 'react';
import { ToolShell, useTool, ImportExport } from '@itsjust/core';
import { toolConfig, myTool, ToolCanvas, ToolToolbar, ToolSidebar } from '@/tool';

export default function ToolClient() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tool = useTool(myTool, canvasRef);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(toolConfig.features.sidebar);

  return (
    <ToolShell
      config={toolConfig}
      actions={tool.toolbarActions}
      sidebarOpen={sidebarOpen}
      onSidebarChange={setSidebarOpen}
      toolbar={
        <>
          <ToolToolbar state={tool.state.data} />
          <ImportExport
            formats={tool.supportedFormats}
            onExport={tool.handleExport}
            onImport={tool.importFromFile}
            isImporting={tool.isImporting}
            isExporting={tool.isExporting}
          />
        </>
      }
      sidebar={<ToolSidebar state={tool.state.data} />}
      canvas={
        <>
          <ToolCanvas
            canvasRef={canvasRef}
            state={tool.state.data}
            onTitleChange={(title) => tool.state.setData((prev) => ({ ...prev, title }))}
          />
        </>
      }
      statusBar={
        <>
        <span className={tool.state.isDirty ? 'status-unsaved' : 'status-saved'}>
          {tool.state.isSaving ? (
            <><span className="status-saving-dot" />Saving...</>
          ) : tool.state.isDirty ? (
            <><span className="status-saving-dot" />Unsaved</>
          ) : tool.state.lastSaved ? (
            <>Saved {tool.state.lastSaved}</>
          ) : 'Ready'}
        </span>
        <span>{tool.state.data.title}</span>
        </>
      }
    />
  );
}
