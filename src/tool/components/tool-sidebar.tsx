'use client';

import type { FilterStep, FilterType, DropShadowValue } from '../types';
import { FILTER_TYPES, PRESETS } from '../types';
import { buildFilterCss } from '../tool-definition';
import type { ReactNode } from 'react';

interface ToolSidebarProps {
  steps: FilterStep[];
  presetsOpen: boolean;
  onTogglePresets: () => void;
  onAddFilter: (type: FilterType) => void;
  onRemoveFilter: (id: string) => void;
  onToggleFilter: (id: string) => void;
  onUpdateFilter: (id: string, value: number | DropShadowValue) => void;
  onApplyPreset: (steps: FilterStep[], presetName?: string) => void;
  onClearAll: () => void;
  onMoveFilter: (id: string, direction: 'up' | 'down') => void;
  onResetDefaults?: () => void;
}

/**
 * Returns the human-readable label for a filter step,
 * looking it up from the FILTER_TYPES configuration.
 *
 * @param step - The filter step to label
 * @returns Display label string
 */
function stepLabel(step: FilterStep): string {
  const ft = FILTER_TYPES.find((f) => f.type === step.type);
  if (ft) return ft.label;
  if (step.type === 'url') return 'SVG Filter';
  return step.type;
}

/**
 * Renders the interactive control for a single filter step.
 * Different controls are shown based on the filter type:
 * - Scalar filters (blur, brightness, etc.): range slider with value display
 * - Drop shadow: multi-field controls for X offset, Y offset, blur, and color
 * - URL: informational text (no slider needed)
 */
function FilterStepControl({
  step,
  onUpdateFilter,
}: {
  step: FilterStep;
  onUpdateFilter: (id: string, value: number | DropShadowValue) => void;
}): ReactNode {
  if (step.type === 'drop-shadow') {
    const ds = step.value as DropShadowValue;
    return (
      <div className="filter-step-drop-shadow">
        <div className="ds-row">
          <label className="ds-label" htmlFor={`ds-x-${step.id}`}>
            X
          </label>
          <input
            id={`ds-x-${step.id}`}
            type="range"
            min={-20}
            max={20}
            value={ds.offsetX}
            onChange={(e) => onUpdateFilter(step.id, { ...ds, offsetX: Number(e.target.value) })}
            disabled={!step.enabled}
            className="filter-slider"
            aria-label={`Drop shadow X offset: ${ds.offsetX}px`}
          />
          <span className="filter-step-value">{ds.offsetX}px</span>
        </div>
        <div className="ds-row">
          <label className="ds-label" htmlFor={`ds-y-${step.id}`}>
            Y
          </label>
          <input
            id={`ds-y-${step.id}`}
            type="range"
            min={-20}
            max={20}
            value={ds.offsetY}
            onChange={(e) => onUpdateFilter(step.id, { ...ds, offsetY: Number(e.target.value) })}
            disabled={!step.enabled}
            className="filter-slider"
            aria-label={`Drop shadow Y offset: ${ds.offsetY}px`}
          />
          <span className="filter-step-value">{ds.offsetY}px</span>
        </div>
        <div className="ds-row">
          <label className="ds-label" htmlFor={`ds-blur-${step.id}`}>
            Blur
          </label>
          <input
            id={`ds-blur-${step.id}`}
            type="range"
            min={0}
            max={40}
            value={ds.blurRadius}
            onChange={(e) => onUpdateFilter(step.id, { ...ds, blurRadius: Number(e.target.value) })}
            disabled={!step.enabled}
            className="filter-slider"
            aria-label={`Drop shadow blur radius: ${ds.blurRadius}px`}
          />
          <span className="filter-step-value">{ds.blurRadius}px</span>
        </div>
        <div className="ds-row">
          <label className="ds-label" htmlFor={`ds-color-${step.id}`}>
            Color
          </label>
          <input
            id={`ds-color-${step.id}`}
            type="color"
            value={ds.color}
            onChange={(e) => onUpdateFilter(step.id, { ...ds, color: e.target.value })}
            disabled={!step.enabled}
            className="filter-color-picker filter-color-picker--small"
            aria-label="Drop shadow color"
          />
          <input
            type="text"
            value={ds.color}
            onChange={(e) => onUpdateFilter(step.id, { ...ds, color: e.target.value })}
            disabled={!step.enabled}
            className="filter-color-input filter-color-input--small"
            aria-label="Drop shadow color hex"
          />
        </div>
      </div>
    );
  }

  if (step.type === 'url') {
    return (
      <div className="filter-step-info">
        <span className="filter-step-info-text">SVG filter reference (no slider)</span>
      </div>
    );
  }

  const ft = FILTER_TYPES.find((f) => f.type === step.type);
  return (
    <div className="filter-step-control">
      <input
        type="range"
        min={ft?.min ?? 0}
        max={ft?.max ?? 100}
        value={step.value as number}
        onChange={(e) => onUpdateFilter(step.id, Number(e.target.value))}
        disabled={!step.enabled}
        className="filter-slider"
        aria-label={`${ft?.label ?? step.type} value`}
      />
      <span className="filter-step-value">
        {step.value}
        {ft?.unit ?? ''}
      </span>
    </div>
  );
}

/**
 * Renders the sidebar panel for the CSS Filter Visualizer.
 * Contains:
 * - Collapsible preset buttons for quick filter configurations
 * - Add Filter grid for appending new filter steps
 * - Active Filter Chain list with enable/disable toggles, move buttons, and remove buttons
 * - Filter order matters in CSS — move items up/down to change the chain order
 */
export function ToolSidebar({
  steps,
  presetsOpen,
  onTogglePresets,
  onAddFilter,
  onRemoveFilter,
  onToggleFilter,
  onUpdateFilter,
  onApplyPreset,
  onClearAll,
  onMoveFilter,
  onResetDefaults,
}: ToolSidebarProps) {
  const enabledCount = steps.filter((s) => s.enabled).length;

  return (
    <div className="filter-sidebar">
      {/* Presets */}
      <div className="sidebar-section">
        <button
          type="button"
          className="sidebar-section-header"
          onClick={onTogglePresets}
          aria-expanded={presetsOpen}
          aria-label={`${presetsOpen ? 'Collapse' : 'Expand'} presets section`}
        >
          <span>Presets</span>
          <span className="sidebar-chevron" data-open={presetsOpen}>
            ▶
          </span>
        </button>
        {presetsOpen && (
          <div className="presets-grid">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="preset-btn"
                onClick={() => onApplyPreset(preset.steps, preset.name)}
                title={preset.description}
                aria-label={`Apply ${preset.name} preset: ${preset.description}`}
              >
                <span className="preset-preview" style={{ filter: buildFilterCss(preset.steps) }}>
                  Aa
                </span>
                <span className="preset-name">{preset.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add filter */}
      <div className="sidebar-section">
        <h3>Add Filter</h3>
        <div className="add-filter-grid">
          {FILTER_TYPES.map((ft) => (
            <button
              key={ft.type}
              type="button"
              className="add-filter-btn"
              onClick={() => onAddFilter(ft.type)}
              aria-label={`Add ${ft.label} filter`}
              title={`${ft.label} (${ft.min}-${ft.max}${ft.unit})`}
            >
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter steps */}
      <div className="sidebar-section">
        <div className="sidebar-section-row">
          <h3>Filter Chain</h3>
          <span className="badge">
            {enabledCount}/{steps.length} active
          </span>
        </div>
        {steps.length === 0 ? (
          <p className="empty-state">No filter steps. Click a filter type above to add one.</p>
        ) : (
          <ul className="filter-steps-list" role="list" aria-label="Active filter steps">
            {steps.map((step, idx) => (
              <li key={step.id} className="filter-step-item">
                <div className="filter-step-header">
                  <button
                    type="button"
                    className={`toggle-btn ${step.enabled ? 'toggle-on' : 'toggle-off'}`}
                    onClick={() => onToggleFilter(step.id)}
                    aria-label={`${step.enabled ? 'Disable' : 'Enable'} ${step.type} filter`}
                    aria-pressed={step.enabled}
                  >
                    {step.enabled ? '✓' : '○'}
                  </button>
                  <span className="filter-step-label">{stepLabel(step)}</span>
                  <div className="filter-step-move-buttons">
                    <button
                      type="button"
                      className="move-filter-btn"
                      onClick={() => onMoveFilter(step.id, 'up')}
                      disabled={idx === 0}
                      aria-label={`Move ${stepLabel(step)} filter up`}
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="move-filter-btn"
                      onClick={() => onMoveFilter(step.id, 'down')}
                      disabled={idx === steps.length - 1}
                      aria-label={`Move ${stepLabel(step)} filter down`}
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>
                  <button
                    type="button"
                    className="remove-filter-btn"
                    onClick={() => onRemoveFilter(step.id)}
                    aria-label={`Remove ${step.type} filter`}
                    title="Remove filter"
                  >
                    ✕
                  </button>
                </div>
                <FilterStepControl step={step} onUpdateFilter={onUpdateFilter} />
              </li>
            ))}
          </ul>
        )}
        {steps.length > 0 && (
          <button
            type="button"
            className="clear-all-btn"
            onClick={onClearAll}
            aria-label="Clear all filter steps"
          >
            Clear All
          </button>
        )}
        {onResetDefaults && (
          <button
            type="button"
            className="reset-defaults-btn"
            onClick={onResetDefaults}
            aria-label="Reset to default filters"
          >
            Reset to Defaults
          </button>
        )}
      </div>
    </div>
  );
}

ToolSidebar.displayName = 'ToolSidebar';
