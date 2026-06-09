'use client';

import { useCallback, useState } from 'react';

/**
 * Renders the filter toolbar with keyboard shortcut reference and help.
 *
 * Provides:
 * - A Shortcuts button that toggles a dropdown listing all keyboard shortcuts
 * - A Help button linking to the GitHub GUIDE.md for full documentation
 */
export function ToolToolbar() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const handleHelp = useCallback(() => {
    window.open(
      'https://github.com/ItsJust-tools/css-filter-visualizer/blob/main/GUIDE.md',
      '_blank',
      'noopener,noreferrer'
    );
  }, []);

  return (
    <div className="filter-toolbar">
      <button
        type="button"
        className="toolbar-btn toolbar-help-link"
        onClick={() => setShortcutsOpen((p) => !p)}
        aria-label={shortcutsOpen ? 'Close keyboard shortcuts' : 'View keyboard shortcuts'}
        title="Keyboard shortcuts"
        aria-expanded={shortcutsOpen}
      >
        Shortcuts
      </button>
      {shortcutsOpen && (
        <div className="shortcuts-dropdown" role="menu" aria-label="Keyboard shortcuts">
          <div className="shortcuts-header">Keyboard Shortcuts</div>
          <div className="shortcut-row">
            <kbd className="shortcut-key">Ctrl+Shift+E</kbd>
            <span className="shortcut-desc">Export all formats</span>
          </div>
          <div className="shortcut-row">
            <kbd className="shortcut-key">Ctrl+Shift+N</kbd>
            <span className="shortcut-desc">Add new filter</span>
          </div>
          <div className="shortcut-row">
            <kbd className="shortcut-key">Delete</kbd>
            <span className="shortcut-desc">Remove selected filter</span>
          </div>
        </div>
      )}
      <button
        type="button"
        className="toolbar-btn toolbar-help-link"
        onClick={handleHelp}
        aria-label="Open help in new tab"
        title="Visit css-filter-visualizer.itsjust.tools"
      >
        Help
      </button>
    </div>
  );
}
