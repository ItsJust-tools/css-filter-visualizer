import { useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useShell } from './tool-shell-context';

const SIDEBAR_WIDTH_KEY = 'itsjust:sidebar-width';
const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 240;

export function Sidebar({ children }: { children?: ReactNode }) {
  const { config, sidebarOpen, toggleSidebar } = useShell();
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SIDEBAR_WIDTH;
    try {
      const stored = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      if (stored) {
        const width = parseInt(stored, 10);
        if (!isNaN(width) && width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH) {
          return width;
        }
      }
    } catch {}
    return DEFAULT_SIDEBAR_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);
  const wasResizingRef = useRef(false);

  useEffect(() => {
    if (wasResizingRef.current && !isResizing) {
      try {
        localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
      } catch {}
    }
    wasResizingRef.current = isResizing;
  }, [isResizing, sidebarWidth]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!isResizingRef.current) return;
      const newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, e.clientX));
      setSidebarWidth(newWidth);
    }
    function handleMouseUp() {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!config.features.sidebar) return null;

  const sidebarStyle: React.CSSProperties & Record<string, string> = {
    '--sidebar-width': `${sidebarWidth}px`,
  };

  return (
    <aside
      className={`tool-shell-sidebar ${sidebarOpen ? 'open' : 'collapsed'} ${isResizing ? 'resizing' : ''}`}
      style={sidebarStyle}
      aria-label="Sidebar"
      inert={!sidebarOpen || undefined}
    >
      <div className="sidebar-header">
        <span className="sidebar-header-title">Options</span>
        <button
          type="button"
          className="sidebar-header-close"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>
      <div className="sidebar-content">{children}</div>
      <div
        className="sidebar-resize-handle"
        onMouseDown={startResize}
        role="separator"
        aria-label="Resize sidebar"
      />
    </aside>
  );
}
