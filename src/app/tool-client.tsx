'use client';

import { useRef, useState } from 'react';
import { ToolShell, useTool, ImportExport, useDragAndDropImport, useRelativeTime } from '@itsjust/core';
import type { UseToolResult } from '@itsjust/core';
import { toolConfig, myTool, ToolCanvas, ToolToolbar, ToolSidebar, type ToolState } from '@/tool';

function StatusBarContent({ tool }: { tool: UseToolResult<ToolState> }) {
  const savedText = useRelativeTime(tool.state.lastSaved);
  return (
    <>
      <span className={tool.state.isDirty ? 'status-unsaved' : 'status-saved'}>
        {tool.state.isSaving ? (
          <><span className="status-saving-dot" />Saving...</>
        ) : tool.state.isDirty ? (
          <><span className="status-saving-dot" />Unsaved</>
        ) : tool.state.lastSaved ? (
          <>{savedText}</>
        ) : (
          'Ready'
        )}
      </span>
      <span>{tool.state.data.title}</span>
    </>
  );
}

export default function ToolClient() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const tool = useTool(myTool, canvasRef);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { isDragging } = useDragAndDropImport({
    onImport: tool.importFromFile,
    acceptedFormats: ['json', 'itsjust'],
    targetRef: dropZoneRef,
  });

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
        <div ref={dropZoneRef} className={`canvas-wrapper ${isDragging ? 'drag-active' : ''}`}>
          {isDragging && (
            <div className="drag-overlay" role="region" aria-label="Drop file to import">
              Drop file to import
            </div>
          )}
          <ToolCanvas
            canvasRef={canvasRef}
            state={tool.state.data}
            onTitleChange={(title) => tool.state.setData((prev) => ({ ...prev, title }))}
          />
        </div>
      }
      statusBar={
        <StatusBarContent tool={tool} />
      }
    />
  );
}
