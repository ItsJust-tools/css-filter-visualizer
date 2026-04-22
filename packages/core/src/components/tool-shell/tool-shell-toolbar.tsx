import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useShell } from './tool-shell-context';
import { UndoIcon, RedoIcon, SidebarIcon, SunIcon, MoonIcon } from './tool-shell-icons';
import { useTheme } from '../theme-provider/theme-provider';

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mounting guard to avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="toolbar-btn theme-toggle-btn"
        aria-label="Toggle theme"
        title="Toggle theme"
        disabled
      >
        <span className="theme-toggle-icon">
          <span style={{ width: 16, height: 16, display: 'inline-block' }} />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="toolbar-btn theme-toggle-btn"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={resolvedTheme === 'dark' ? 'Light mode (D)' : 'Dark mode (D)'}
    >
      <span className="theme-toggle-icon">
        <SunIcon className={resolvedTheme === 'dark' ? 'fade-in' : 'fade-out'} />
        <MoonIcon className={resolvedTheme === 'dark' ? 'fade-out' : 'fade-in'} />
      </span>
    </button>
  );
}

export function Toolbar({ children }: { children?: ReactNode }) {
  const { config, actions, sidebarOpen } = useShell();
  const brandText = config.theme?.brand ?? config.name;
  const brandIcon = config.theme?.icon;
  const brandUrl = config.theme?.brandUrl;

  const brandContent = (
    <>
      {brandIcon && <span className="toolbar-brand-icon">{brandIcon}</span>}
      {brandText}
    </>
  );

  return (
    <header className="tool-shell-toolbar" role="toolbar" aria-label="Tool toolbar">
      <div className="toolbar-left">
        {brandUrl ? (
          <a href={brandUrl} className="toolbar-brand toolbar-brand-link">{brandContent}</a>
        ) : (
          <span className="toolbar-brand">{brandContent}</span>
        )}
        {config.features.undoRedo && (
          <>
            <button
              type="button"
              className="toolbar-btn"
              aria-label="Undo (Ctrl+Z)"
              title="Undo (Ctrl+Z)"
              disabled={!actions.canUndo}
              onClick={actions.onUndo}
            >
              <UndoIcon />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              aria-label="Redo (Ctrl+Y)"
              title="Redo (Ctrl+Y)"
              disabled={!actions.canRedo}
              onClick={actions.onRedo}
            >
              <RedoIcon />
            </button>
          </>
        )}
        {children}
      </div>
      <div className="toolbar-right">
        {config.features.sidebar && (
          <button
            type="button"
            className="toolbar-btn toolbar-btn-sidebar"
            onClick={actions.onToggleSidebar}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <SidebarIcon open={sidebarOpen} />
          </button>
        )}
        {config.features.darkMode && <ThemeToggle />}
      </div>
    </header>
  );
}
