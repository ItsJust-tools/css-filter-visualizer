'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExportFormat } from '../../types';

export interface ImportExportProps {
  /** Supported formats for this tool */
  formats: ExportFormat[];
  /** Called when user wants to export */
  onExport?: (format: ExportFormat) => void;
  /** Called when a file is selected for import */
  onImport?: (file: File) => void;
  /** Currently importing state */
  isImporting?: boolean;
  /** Currently exporting state */
  isExporting?: boolean;
}

function ImportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v8M5 8l3 3 3-3" />
      <path d="M3 11v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v8M5 8l3 3 3-3" />
      <rect x="3" y="11" width="10" height="2" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ImportExport({
  formats,
  onExport,
  onImport,
  isImporting = false,
  isExporting = false,
}: ImportExportProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && e.target instanceof Node && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleImportClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImport) return;
      onImport(file);
      e.target.value = '';
    },
    [onImport],
  );

  const formatLabels: Record<ExportFormat, string> = {
    png: 'PNG Image',
    jpeg: 'JPEG Image',
    webp: 'WebP Image',
    pdf: 'PDF Document',
    json: 'JSON Data',
  };

  return (
    <div className="import-export-group" ref={dropdownRef}>
      {/* Hidden file input for import */}
      <input
        ref={inputRef}
        type="file"
        accept=".itsjust.json,.json,.svg"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Import Button */}
      <button
        type="button"
        className="toolbar-btn"
        onClick={handleImportClick}
        disabled={isImporting}
        title="Import file"
        aria-label="Import file"
      >
        <ImportIcon />
        <span>Import</span>
        {isImporting && <span className="spinner-icon" />}
      </button>

      {/* Export Dropdown */}
      <div className="export-dropdown">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => setDropdownOpen((v) => !v)}
          disabled={isExporting || !onExport}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          title="Export"
          aria-label="Export"
        >
          <DownloadIcon />
          <span>Export</span>
        </button>

        {dropdownOpen && onExport && (
          <ul className="dropdown-menu" role="listbox" aria-label="Export format">
            {formats.map((f, i) => (
              <li key={f}>
                <button
                  type="button"
                  className={`dropdown-item ${i === selected ? 'dropdown-item-active' : ''}`}
                  role="option"
                  aria-selected={i === selected}
                  onClick={() => {
                    onExport(f);
                    setDropdownOpen(false);
                  }}
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
    </div>
  );
}
