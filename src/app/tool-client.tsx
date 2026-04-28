'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { ToolShell, useTool, ImportExport } from '@itsjust/core';
import { toolConfig, myTool, ToolCanvas, ToolToolbar, ToolSidebar } from '@/tool';

export default function ToolClient() {
  const ToolShellCompat = ToolShell as unknown as ComponentType<Record<string, unknown>> & {
    Toolbar?: ComponentType<{ children?: ReactNode }>;
    Body?: ComponentType<{ children?: ReactNode }>;
    Sidebar?: ComponentType<{ children?: ReactNode }>;
    Canvas?: ComponentType<{ children?: ReactNode }>;
    StatusBar?: ComponentType<{ children?: ReactNode }>;
  };
  const canvasRef = useRef<HTMLDivElement>(null);
  const tool = useTool(myTool, canvasRef);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(toolConfig.features.sidebar);
  const title = tool.state.data.title.trim() || toolConfig.name;

  useEffect(() => {
    document.title = title;
  }, [title]);

  const handleRename = useCallback(() => {
    const nextTitle = window.prompt('Neuen Namen eingeben:', tool.state.data.title);
    if (nextTitle === null) return;
    const normalizedTitle = nextTitle.trim() || toolConfig.name;
    tool.state.setData((prev) => ({ ...prev, title: normalizedTitle }));
  }, [tool.state]);

  const shellConfig = useMemo(
    () => ({
      ...toolConfig,
      name: title,
      theme: {
        ...toolConfig.theme,
        brand: title,
      },
    }),
    [title],
  );

  const toolbarContent = (
    <>
      <ToolToolbar state={tool.state.data} />
      <ImportExport
        formats={tool.supportedFormats}
        onExport={tool.handleExport}
        onImport={tool.importFromFile}
        isImporting={tool.isImporting}
      />
    </>
  );

  const sidebarContent = <ToolSidebar state={tool.state.data} />;

  const canvasContent = (
    <ToolCanvas
      canvasRef={canvasRef}
      state={tool.state.data}
    />
  );

  const statusBarContent = (
    <>
      <span className={tool.state.isDirty ? 'status-unsaved' : 'status-saved'}>
        {tool.state.isDirty ? (
          <><span className="status-saving-dot" />Unsaved</>
        ) : tool.state.lastSaved ? (
          <>Saved {tool.state.lastSaved}</>
        ) : 'Ready'}
      </span>
      <span>{tool.state.data.title}</span>
    </>
  );

  const hasLegacySections = Boolean(
    ToolShellCompat.Toolbar &&
    ToolShellCompat.Body &&
    ToolShellCompat.Sidebar &&
    ToolShellCompat.Canvas &&
    ToolShellCompat.StatusBar,
  );

  return (
    <ToolShellCompat
      config={shellConfig}
      actions={{ ...tool.toolbarActions, onBrandClick: handleRename }}
      sidebarOpen={sidebarOpen}
      onSidebarChange={setSidebarOpen}
      toolbar={toolbarContent}
      sidebar={sidebarContent}
      canvas={canvasContent}
      statusBar={statusBarContent}
    >
      {hasLegacySections
        ? (() => {
            const ToolbarSection = ToolShellCompat.Toolbar as ComponentType<{ children?: ReactNode }>;
            const BodySection = ToolShellCompat.Body as ComponentType<{ children?: ReactNode }>;
            const SidebarSection = ToolShellCompat.Sidebar as ComponentType<{ children?: ReactNode }>;
            const CanvasSection = ToolShellCompat.Canvas as ComponentType<{ children?: ReactNode }>;
            const StatusBarSection = ToolShellCompat.StatusBar as ComponentType<{ children?: ReactNode }>;
            return (
              <>
                <ToolbarSection>{toolbarContent}</ToolbarSection>
                <BodySection>
                  <SidebarSection>{sidebarContent}</SidebarSection>
                  <CanvasSection>{canvasContent}</CanvasSection>
                </BodySection>
                <StatusBarSection>{statusBarContent}</StatusBarSection>
              </>
            );
          })()
        : null}
    </ToolShellCompat>
  );
}
