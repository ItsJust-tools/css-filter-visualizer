'use client';

import { useEffect, useRef, useState } from 'react';

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 72;

interface ToolSidebarProps {
  text: string;
  fontSize?: number;
  onFontSizeChange?: (delta: number) => void;
  onFontSizeSet?: (value: number) => void;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countChars(text: string): number {
  return text.length;
}

function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

export function ToolSidebar({ text, fontSize, onFontSizeChange, onFontSizeSet }: ToolSidebarProps) {
  const words = countWords(text);
  const chars = countChars(text);
  const lines = countLines(text);
  const charsNoSpaces = text.replace(/\s/g, '').length;

  const [isEditingFontSize, setIsEditingFontSize] = useState(false);
  const [fontSizeInput, setFontSizeInput] = useState(String(fontSize ?? MIN_FONT_SIZE));
  const fontSizeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingFontSize) {
      fontSizeInputRef.current?.focus();
      fontSizeInputRef.current?.select();
    }
  }, [isEditingFontSize]);

  function commitFontSize() {
    const parsed = parseInt(fontSizeInput, 10);
    if (!Number.isNaN(parsed) && onFontSizeSet) {
      const clamped = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, parsed));
      onFontSizeSet(clamped);
    }
    setIsEditingFontSize(false);
  }

  function handleFontSizeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitFontSize();
    } else if (e.key === 'Escape') {
      setIsEditingFontSize(false);
      setFontSizeInput(String(fontSize ?? MIN_FONT_SIZE));
    }
  }

  function enterEditMode() {
    setFontSizeInput(String(fontSize ?? MIN_FONT_SIZE));
    setIsEditingFontSize(true);
  }

  return (
    <div className="notepad-sidebar">
      <div className="sidebar-section">
        <h3>Document Stats</h3>
        <dl className="stats-list">
          <div className="stat-row">
            <dt>Words</dt>
            <dd>{words.toLocaleString()}</dd>
          </div>
          <div className="stat-row">
            <dt>Characters</dt>
            <dd>{chars.toLocaleString()}</dd>
          </div>
          <div className="stat-row">
            <dt>Characters (no spaces)</dt>
            <dd>{charsNoSpaces.toLocaleString()}</dd>
          </div>
          <div className="stat-row">
            <dt>Lines</dt>
            <dd>{lines.toLocaleString()}</dd>
          </div>
        </dl>
      </div>

      {fontSize !== undefined && onFontSizeChange && (
        <div className="sidebar-section">
          <h3>Font Size</h3>
          <div className="sidebar-font-controls">
            <button
              type="button"
              className="font-btn font-btn-decrease"
              onClick={() => onFontSizeChange(-2)}
              aria-label="Decrease font size"
              title="Decrease font size"
            >
              A−
            </button>
            {isEditingFontSize && onFontSizeSet ? (
              <input
                ref={fontSizeInputRef}
                type="number"
                className="font-size-input"
                min={MIN_FONT_SIZE}
                max={MAX_FONT_SIZE}
                value={fontSizeInput}
                onChange={(e) => setFontSizeInput(e.target.value)}
                onKeyDown={handleFontSizeKeyDown}
                onBlur={commitFontSize}
                aria-label="Edit font size"
              />
            ) : (
              <button
                type="button"
                className="font-size-display"
                onClick={() => onFontSizeSet && enterEditMode()}
                aria-label={`Current font size is ${fontSize}px. Click to edit`}
                title="Click to edit font size"
                disabled={!onFontSizeSet}
              >
                {fontSize}px
              </button>
            )}
            <button
              type="button"
              className="font-btn font-btn-increase"
              onClick={() => onFontSizeChange(2)}
              aria-label="Increase font size"
              title="Increase font size"
            >
              A+
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
