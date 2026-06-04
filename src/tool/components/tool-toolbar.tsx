'use client';

import { useCallback } from 'react';

export function ToolToolbar() {
  const handleHelp = useCallback(() => {
    window.open(
      'https://css-filter-visualizer.itsjust.tools',
      '_blank',
      'noopener,noreferrer'
    );
  }, []);

  return (
    <div className="filter-toolbar">
      <button
        type="button"
        className="toolbar-btn toolbar-help-link"
        onClick={handleHelp}
        aria-label="Open help page (opens in new tab)"
        title="Visit css-filter-visualizer.itsjust.tools"
      >
        Help
      </button>
    </div>
  );
}
