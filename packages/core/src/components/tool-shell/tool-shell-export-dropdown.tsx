import { useState, useRef, useEffect } from 'react';
import type { ExportFormat } from '../../types';
import { ExportIcon } from './tool-shell-icons';

const formatLabels: Record<ExportFormat, string> = {
  png: 'PNG Image',
  jpeg: 'JPEG Image',
  webp: 'WebP Image',
  pdf: 'PDF Document',
  json: 'JSON Data',
};

export function ExportDropdown({ formats, onExport }: { formats: ExportFormat[]; onExport: (f: ExportFormat) => void }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((i) => Math.min(i + 1, formats.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); onExport(formats[selected]); setOpen(false); }
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, selected, formats, onExport]);

  return (
    <div className="toolbar-dropdown" ref={ref}>
      <button
        type="button"
        className="toolbar-btn"
        onClick={() => { setOpen((v) => !v); setSelected(0); }}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Export"
        aria-label="Export"
      >
        <ExportIcon />
        <span>Export</span>
      </button>
      {open && (
        <ul className="dropdown-menu" role="listbox" aria-label="Export format">
          {formats.map((f, i) => (
            <li key={f}>
              <button
                type="button"
                className={`dropdown-item ${i === selected ? 'dropdown-item-active' : ''}`}
                role="option"
                aria-selected={i === selected}
                onClick={() => { onExport(f); setOpen(false); }}
                onMouseEnter={() => setSelected(i)}
              >
                <span className="dropdown-label">{formatLabels[f] ?? f.toUpperCase()}</span>
                <span className="dropdown-shortcut">.{f}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
