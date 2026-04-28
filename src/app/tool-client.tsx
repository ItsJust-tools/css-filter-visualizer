'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { ToolShell, useTool, ImportExport } from '@itsjust/core';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { toolConfig, templateBaseVersion, myTool, ToolCanvas, ToolToolbar, ToolSidebar } from '@/tool';

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
  const setToolData = tool.state.setData;
  const showToast = tool.toast;
  const [isSharing, setIsSharing] = useState(false);
  const hasLoadedSharedState = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(toolConfig.features.sidebar);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState(tool.state.data.title);
  const title = tool.state.data.title.trim() || toolConfig.name;

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (hasLoadedSharedState.current) return;
    hasLoadedSharedState.current = true;
    const params = new URLSearchParams(window.location.search);
    const encodedState = params.get('state');
    if (!encodedState) return;
    try {
      const serialized = decompressFromEncodedURIComponent(encodedState);
      if (!serialized) throw new Error('Invalid shared URL');
      const parsed: unknown = JSON.parse(serialized);
      const deserialized = myTool.deserialize(parsed);
      if (!deserialized.success) throw new Error(deserialized.error);
      setToolData(deserialized.data);
      showToast('Loaded state from shared URL', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load shared URL';
      showToast(message, 'error');
    }
  }, [setToolData, showToast]);

  const startRename = useCallback(() => {
    setRenameDraft(tool.state.data.title);
    setIsRenaming(true);
  }, [tool.state.data.title]);

  const commitRename = useCallback(() => {
    const normalizedTitle = renameDraft.trim() || toolConfig.name;
    setToolData((prev) => ({ ...prev, title: normalizedTitle }));
    setIsRenaming(false);
  }, [renameDraft, setToolData]);

  const cancelRename = useCallback(() => {
    setRenameDraft(tool.state.data.title);
    setIsRenaming(false);
  }, [tool.state.data.title]);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const serialized = myTool.serialize(tool.state.data);
      const encodedState = compressToEncodedURIComponent(serialized);
      if (!encodedState) throw new Error('Failed to encode state for URL');
      const url = new URL(window.location.href);
      url.searchParams.set('state', encodedState);
      url.searchParams.set('tool', toolConfig.id);
      window.history.replaceState(null, '', url.toString());

      const shareUrl = url.toString();
      if (navigator.share) {
        try {
          await navigator.share({ title, url: shareUrl });
          showToast('Shared URL ready', 'success');
          return;
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') return;
        }
      }
      await navigator.clipboard.writeText(shareUrl);
      showToast('Share URL copied to clipboard', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create share URL';
      showToast(message, 'error');
    } finally {
      setIsSharing(false);
    }
  }, [showToast, title, tool.state.data]);

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
      <ToolToolbar />
      <ImportExport
        formats={tool.supportedFormats}
        onExport={tool.handleExport}
        onImport={tool.importFromFile}
        isImporting={tool.isImporting}
        onShare={handleShare}
        isSharing={isSharing}
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
      <span className={`status-slot status-slot-state ${tool.state.isDirty ? 'status-unsaved' : 'status-saved'}`}>
        {tool.state.isDirty ? (
          <><span className="status-saving-dot" />Unsaved</>
        ) : tool.state.lastSaved ? (
          <>Saved {tool.state.lastSaved}</>
        ) : 'Ready'}
      </span>
      <span className="status-slot status-slot-title">{tool.state.data.title}</span>
      <span className="status-slot status-slot-tool-version">Tool v{toolConfig.version}</span>
      <span className="status-slot status-slot-template-version">Template v{templateBaseVersion}</span>
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
