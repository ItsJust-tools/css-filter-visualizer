'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ToolShell, useTool, ImportExport } from '@itsjust/core';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import {
  toolConfig,
  templateBaseVersion,
  cssFilterTool,
  ToolCanvas,
  ToolToolbar,
  ToolSidebar,
} from '@/tool';
import type {
  FilterState,
  FilterStep,
  FilterType,
  ScalarFilterType,
  DropShadowValue,
} from '@/tool/types';
import { createFilterStep, FILTER_TYPES } from '@/tool/types';

import { generateId } from '@/tool/lib/utils';

/**
 * Main client component for the CSS Filter Visualizer.
 * Manages filter state, presets, sharing, undo/redo, and the tool shell layout.
 */
export default function ToolClient() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tool = useTool(cssFilterTool, canvasRef);
  const setToolData = tool.state.setData;
  const showToast = tool.toast;
  const [isSharing, setIsSharing] = useState(false);
  const hasLoadedSharedState = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth > 768 && toolConfig.features.sidebar
  );
  const [presetsOpen, setPresetsOpen] = useState(true);

  const title = toolConfig.name;
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [editValue, setEditValue] = useState(title);

  useEffect(() => {
    document.title = title;
  }, [title]);

  const handleBaseColorChange = useCallback(
    (color: string) => {
      setToolData((prev) => ({ ...prev, baseColor: color }));
    },
    [setToolData]
  );

  const handlePreviewTextChange = useCallback(
    (text: string) => {
      setToolData((prev) => ({ ...prev, previewText: text }));
    },
    [setToolData]
  );

  const handleAddFilter = useCallback(
    (type: FilterType) => {
      if (type === 'drop-shadow') {
        const newStep = createFilterStep(type);
        setToolData((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
        showToast('Added Drop Shadow filter', 'success');
        return;
      }
      if (type === 'url') {
        const newStep = createFilterStep(type);
        setToolData((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
        showToast('Added SVG Filter (URL) filter', 'success');
        return;
      }
      const ft = FILTER_TYPES.find((f) => f.type === type);
      const defaultValue = ft?.default ?? 50;
      const newStep = createFilterStep(type as ScalarFilterType, defaultValue);
      setToolData((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
      showToast(`Added ${ft?.label ?? type} filter`, 'success');
    },
    [setToolData, showToast]
  );

  const handleRemoveFilter = useCallback(
    (id: string) => {
      setToolData((prev) => ({
        ...prev,
        steps: prev.steps.filter((s) => s.id !== id),
      }));
    },
    [setToolData]
  );

  const handleToggleFilter = useCallback(
    (id: string) => {
      setToolData((prev) => ({
        ...prev,
        steps: prev.steps.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
      }));
    },
    [setToolData]
  );

  const handleUpdateFilter = useCallback(
    (id: string, value: number | DropShadowValue) => {
      setToolData((prev) => ({
        ...prev,
        steps: prev.steps.map((s): FilterStep => {
          if (s.id !== id) return s;
          if (s.type === 'drop-shadow') {
            return { ...s, value: value as DropShadowValue };
          }
          if (s.type === 'url') return s;
          return { ...s, value: value as number };
        }),
      }));
    },
    [setToolData]
  );

  const handleApplyPreset = useCallback(
    (steps: FilterState['steps']) => {
      const clonedSteps: FilterStep[] = steps.map((s) => ({
        ...s,
        id: generateId(),
      }));
      setToolData((prev) => ({
        ...prev,
        steps: clonedSteps,
        presetName: '',
      }));
      showToast('Preset applied', 'success');
    },
    [setToolData, showToast]
  );

  const handleMoveFilter = useCallback(
    (id: string, direction: 'up' | 'down') => {
      setToolData((prev) => {
        const idx = prev.steps.findIndex((s) => s.id === id);
        if (idx === -1) return prev;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= prev.steps.length) return prev;
        const steps = [...prev.steps] as FilterStep[];
        const temp = steps[idx]!;
        steps[idx] = steps[newIdx]!;
        steps[newIdx] = temp;
        return { ...prev, steps };
      });
    },
    [setToolData]
  );

  const handleClearAll = useCallback(() => {
    setToolData((prev) => ({ ...prev, steps: [] }));
    showToast('All filters cleared', 'success');
  }, [setToolData, showToast]);

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
      const deserialized = cssFilterTool.deserialize(parsed);
      if (!deserialized.success) throw new Error(deserialized.error);
      setToolData(deserialized.data);
      showToast('Loaded state from shared URL', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load shared URL';
      showToast(message, 'error');
    }
  }, [setToolData, showToast]);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    try {
      const serialized = cssFilterTool.serialize(tool.state.data);
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
  }, [showToast, tool.state.data, title]);

  const toolbarActions = useMemo(
    () => ({
      ...tool.toolbarActions,
      onBrandClick: () => {
        setEditValue(title);
        setIsEditingBrand(true);
      },
      isBrandEditing: isEditingBrand,
      brandValue: isEditingBrand ? editValue : title,
      onBrandChange: (value: string) => setEditValue(value),
      onBrandCommit: () => {
        const trimmed = editValue.trim();
        setEditValue(trimmed || title);
        setIsEditingBrand(false);
      },
      onBrandCancel: () => {
        setEditValue(title);
        setIsEditingBrand(false);
      },
    }),
    [tool.toolbarActions, isEditingBrand, editValue, title]
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

  const sidebarContent = (
    <ToolSidebar
      steps={tool.state.data.steps}
      presetsOpen={presetsOpen}
      onTogglePresets={() => setPresetsOpen((p) => !p)}
      onAddFilter={handleAddFilter}
      onRemoveFilter={handleRemoveFilter}
      onToggleFilter={handleToggleFilter}
      onUpdateFilter={handleUpdateFilter}
      onApplyPreset={handleApplyPreset}
      onClearAll={handleClearAll}
      onMoveFilter={handleMoveFilter}
    />
  );

  const canvasContent = (
    <ToolCanvas
      canvasRef={canvasRef}
      state={tool.state.data}
      onBaseColorChange={handleBaseColorChange}
      onPreviewTextChange={handlePreviewTextChange}
    />
  );

  const enabledCount = tool.state.data.steps.filter((s) => s.enabled).length;

  const statusBarContent = (
    <>
      <span
        className={`status-slot status-slot-state ${tool.state.isDirty ? 'status-unsaved' : 'status-saved'}`}
      >
        {tool.state.isDirty ? (
          <>
            <span className="status-saving-dot" />
            Unsaved
          </>
        ) : tool.state.lastSaved ? (
          <>Saved {tool.state.lastSaved}</>
        ) : (
          'Ready'
        )}
      </span>
      <span className="status-slot status-slot-steps">{enabledCount} filters active</span>
      <span className="status-slot status-slot-tool-version">Tool v{toolConfig.version}</span>
      <span className="status-slot status-slot-template-version">
        Template v{templateBaseVersion}
      </span>
    </>
  );

  return (
    <ToolShell
      config={toolConfig}
      actions={toolbarActions}
      sidebarOpen={sidebarOpen}
      onSidebarChange={setSidebarOpen}
      toolbar={toolbarContent}
      sidebar={sidebarContent}
      canvas={canvasContent}
      statusBar={statusBarContent}
    />
  );
}
