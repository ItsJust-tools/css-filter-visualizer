'use client';

import { useCallback, useMemo } from 'react';
import type { Tool } from '../tool';
import type { ExportFormat } from '../types';
import type { ToolbarActions } from '../components/tool-shell';
import { useToolState } from './use-tool-state';
import { useExport } from './use-export';
import { useImport } from './use-import';
import type { ImportResult } from './use-import';
import { useToast } from '../components/toast';

export interface UseToolResult<TState> {
  /** Managed tool state (undo/redo/auto-save) */
  state: ReturnType<typeof useToolState<TState>>;
  /** Ready-to-use toolbar actions for <ToolShell> */
  toolbarActions: ToolbarActions;
  /** Import a file (pass to <ImportExport>) */
  importFromFile: (file: File) => Promise<ImportResult>;
  /** Whether an import is in progress */
  isImporting: boolean;
  /** Export handler (pass to <ImportExport>) */
  handleExport: (format: ExportFormat) => Promise<void>;
  /** Formats this tool supports */
  supportedFormats: ExportFormat[];
  /** Show a toast notification */
  toast: (message: string, type?: 'success' | 'error') => void;
}

/**
 * Unified hook that wires up state, export, import, share, undo/redo,
 * and command-palette actions for any tool that implements the {@link Tool} contract.
 *
 * @example
 * const tool = useTool(myToolDefinition, canvasRef);
 *
 * return (
 *   <ToolShell config={myToolDefinition.config} actions={tool.toolbarActions} commandActions={tool.commandActions}>
 *     …
 *   </ToolShell>
 * );
 */
export function useTool<TState>(
  tool: Tool<TState>,
  canvasRef: React.RefObject<HTMLElement | null>,
): UseToolResult<TState> {
  const state = useToolState<TState>(tool.initialState, { key: tool.id });
  const { exportTo, supportedFormats } = useExport(canvasRef, tool.config, () => tool.serialize(state.data));
  const { importFromFile, isImporting } = useImport({
    acceptedFormats: tool.config.exportFormats,
    onImport: (result) => {
      if (result.success && result.data) {
        state.setData(tool.deserialize(result.data));
      }
    },
  });
  const { toast } = useToast();

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      try {
        await exportTo(format);
        toast(`Exported as .${format}`, 'success');
      } catch (error) {
        console.error('[Export] Failed:', error);
        toast('Export failed', 'error');
      }
    },
    [exportTo, toast],
  );

  const toolbarActions: ToolbarActions = useMemo(
    () => ({
      onUndo: state.canUndo ? () => state.undo() : undefined,
      onRedo: state.canRedo ? () => state.redo() : undefined,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
      onExport: handleExport,
      supportedFormats,
    }),
    [state, handleExport, supportedFormats],
  );

  return {
    state,
    toolbarActions,
    importFromFile,
    isImporting,
    handleExport,
    supportedFormats,
    toast,
  };
}
