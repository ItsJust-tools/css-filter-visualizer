import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useShell } from './tool-shell-context';
import { UndoIcon, RedoIcon, SidebarIcon, SunIcon, MoonIcon } from './tool-shell-icons';
import { useTheme } from '../theme-provider/theme-provider';
import { t } from '../../i18n/strings';

function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

function modKey(): string {
  return isMac() ? 'Cmd' : 'Ctrl';
}

function TooltipLabel({ text }: { text: string }) {
  return <span className="toolbar-tooltip" role="tooltip">{text}</span>;
}

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
      aria-label={resolvedTheme === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')}
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
  const { config, actions, sidebarOpen, toggleSidebar } = useShell();
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
    <header className="tool-shell-toolbar" role="toolbar" aria-label={t('toolToolbar')}>
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
              aria-label={`${t('undo')} (${modKey()}+Z)`}
              disabled={!actions.canUndo}
              onClick={actions.onUndo}
            >
              <UndoIcon />
              <TooltipLabel text={`${t('undo')} (${modKey()}+Z)`} />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              aria-label={`${t('redo')} (${modKey()}${isMac() ? '+Shift+Z' : '+Y'})`}
              disabled={!actions.canRedo}
              onClick={actions.onRedo}
            >
              <RedoIcon />
              <TooltipLabel text={`${t('redo')} (${modKey()}${isMac() ? '+Shift+Z' : '+Y'})`} />
            </button>
            {actions.onReset && (
              <button
                type="button"
                className="toolbar-btn"
                aria-label={t('reset')}
                onClick={actions.onReset}
              >
                {t('reset')}
                <TooltipLabel text={t('reset')} />
              </button>
            )}
          </>
        )}
        {children}
      </div>
      <div className="toolbar-right">
        {config.features.sidebar && (
          <button
            type="button"
            className="toolbar-btn toolbar-btn-sidebar"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? t('closeSidebar') : t('toggleSidebar')}
          >
            <SidebarIcon open={sidebarOpen} />
            <TooltipLabel text={sidebarOpen ? t('closeSidebar') : t('toggleSidebar')} />
          </button>
        )}
        {config.features.darkMode && <ThemeToggle />}
      </div>
    </header>
  );
}
Toolbar.displayName = 'Toolbar';
ThemeToggle.displayName = 'ThemeToggle';
