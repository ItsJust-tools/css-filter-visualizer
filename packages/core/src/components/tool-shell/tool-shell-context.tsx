import { createContext, useContext } from 'react';
import type { ExportFormat, ToolConfig } from '../../types';

export interface ToolbarActions {
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: (format: ExportFormat) => void;
  onToggleSidebar?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  supportedFormats?: ExportFormat[];
}

export interface ShellContextValue {
  config: ToolConfig;
  readOnly: boolean;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  actions: ToolbarActions;
}

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('ToolShell compound components must be used within ToolShell');
  return ctx;
}
