'use client';

import type { FilterStep, FilterType } from '../types';
import { FILTER_TYPES, PRESETS } from '../types';
import { buildFilterCss } from '../tool-definition';

interface ToolSidebarProps {
  steps: FilterStep[];
  presetsOpen: boolean;
  onTogglePresets: () => void;
  onAddFilter: (type: FilterType) => void;
  onRemoveFilter: (id: string) => void;
  onToggleFilter: (id: string) => void;
  onUpdateFilter: (id: string, value: number) => void;
  onApplyPreset: (steps: FilterStep[]) => void;
  onClearAll: () => void;
}

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
          aria-label="Toggle presets"
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
                onClick={() => onApplyPreset(preset.steps)}
                title={preset.description}
                aria-label={`Apply ${preset.name} preset: ${preset.description}`}
              >
                <span
                  className="preset-preview"
                  style={{ filter: buildFilterCss(preset.steps) }}
                >
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
          <span className="badge">{enabledCount}/{steps.length} active</span>
        </div>
        {steps.length === 0 ? (
          <p className="empty-state">No filter steps. Click a filter type above to add one.</p>
        ) : (
          <ul className="filter-steps-list" role="list" aria-label="Active filter steps">
            {steps.map((step) => {
              const ft = FILTER_TYPES.find((f) => f.type === step.type);
              return (
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
                    <span className="filter-step-label">{ft?.label ?? step.type}</span>
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
                  <div className="filter-step-control">
                    <input
                      type="range"
                      min={ft?.min ?? 0}
                      max={ft?.max ?? 100}
                      value={step.value}
                      onChange={(e) => onUpdateFilter(step.id, Number(e.target.value))}
                      disabled={!step.enabled}
                      className="filter-slider"
                      aria-label={`${ft?.label ?? step.type} value`}
                    />
                    <span className="filter-step-value">
                      {step.value}{ft?.unit ?? ''}
                    </span>
                  </div>
                </li>
              );
            })}
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
      </div>
    </div>
  );
}
