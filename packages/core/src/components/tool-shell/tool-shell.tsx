'use client';

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { ToolConfig } from '../../types';
import { KeyboardShortcutsOverlay } from '../keyboard-shortcuts/keyboard-shortcuts';
import { ShellContext, type ToolbarActions } from './tool-shell-context';
import { Toolbar } from './tool-shell-toolbar';
import { Body } from './tool-shell-body';
import { Sidebar } from './tool-shell-sidebar';
import { Canvas } from './tool-shell-canvas';
import { StatusBar } from './tool-shell-statusbar';
import { LoadingSkeleton } from './tool-shell-loading';
import { useKeyboardShortcuts, buildDefaultShortcutGroups } from './tool-shell-shortcuts';

export { type ToolbarActions } from './tool-shell-context';

interface ToolShellProps {
  config: ToolConfig;
  readOnly?: boolean;
  actions?: ToolbarActions;
  sidebarOpen?: boolean;
  onSidebarChange?: (open: boolean) => void;
  children?: ReactNode;
}

function ToolShellComponent({ config, readOnly = false, actions = {}, sidebarOpen: controlledSidebarOpen, onSidebarChange, children }: ToolShellProps) {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(config.features.sidebar);
  const isControlled = controlledSidebarOpen !== undefined;
  const sidebarOpen = isControlled ? controlledSidebarOpen : internalSidebarOpen;
  const toggleSidebar = useCallback(() => {
    if (isControlled) {
      onSidebarChange?.(!sidebarOpen);
    } else {
      setInternalSidebarOpen((v) => !v);
    }
  }, [isControlled, onSidebarChange, sidebarOpen]);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const shellActions: ToolbarActions = {
    ...actions,
    onToggleSidebar: toggleSidebar,
  };

  useKeyboardShortcuts(shellActions, () => setShortcutsOpen(true));

  const shortcutGroups = useMemo(() => {
    const defaults = buildDefaultShortcutGroups(config);
    if (config.shortcuts?.length) return [...defaults, ...config.shortcuts];
    return defaults;
  }, [config]);

  return (
    <ShellContext.Provider value={{ config, readOnly, sidebarOpen, toggleSidebar, actions: shellActions }}>
      <div className="tool-shell" data-tool={config.id} data-readonly={readOnly || undefined}>
        {children}
        {sidebarOpen && isMobile && <div className="sidebar-backdrop" onClick={toggleSidebar} />}
        {shortcutsOpen && (
          <KeyboardShortcutsOverlay
            groups={shortcutGroups}
            onClose={() => setShortcutsOpen(false)}
          />
        )}
      </div>
    </ShellContext.Provider>
  );
}

export const ToolShell = Object.assign(ToolShellComponent, {
  Toolbar,
  Body,
  Sidebar,
  Canvas,
  StatusBar,
  LoadingSkeleton,
});
