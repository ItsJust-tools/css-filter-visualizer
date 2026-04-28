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
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState(tool.state.data.title);
  const title = tool.state.data.title.trim() || toolConfig.name;

  useEffect(() => {
    document.title = title;
  }, [title]);

  const startRename = useCallback(() => {
    setRenameDraft(tool.state.data.title);
    setIsRenaming(true);
  }, [tool.state.data.title]);

  const commitRename = useCallback(() => {
    const normalizedTitle = renameDraft.trim() || toolConfig.name;
    tool.state.setData((prev) => ({ ...prev, title: normalizedTitle }));
    setIsRenaming(false);
  }, [renameDraft, tool.state]);

  const cancelRename = useCallback(() => {
    setRenameDraft(tool.state.data.title);
    setIsRenaming(false);
  }, [tool.state.data.title]);

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
      <span>v{toolConfig.version}</span>
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
      actions={{
        ...tool.toolbarActions,
        onBrandClick: startRename,
        isBrandEditing: isRenaming,
        brandValue: renameDraft,
        onBrandChange: setRenameDraft,
        onBrandCommit: commitRename,
        onBrandCancel: cancelRename,
      }}
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
