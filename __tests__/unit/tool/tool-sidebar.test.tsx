import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolSidebar } from '@/tool/components/tool-sidebar';
import { ToolToolbar } from '@/tool/components/tool-toolbar';
import { ToolCanvas } from '@/tool/components/tool-canvas';
import { initialState } from '@/tool/tool-definition';
import type { FilterState, FilterStep, DropShadowValue } from '@/tool/types';

const scalarSteps: FilterStep[] = [
  { id: 's1', type: 'blur', value: 4, enabled: true },
  { id: 's2', type: 'brightness', value: 120, enabled: false },
];

const dropShadowSteps: FilterStep[] = [
  {
    id: 'd1',
    type: 'drop-shadow',
    value: { offsetX: 2, offsetY: 2, blurRadius: 4, color: '#000000' },
    enabled: true,
  },
];

const urlSteps: FilterStep[] = [{ id: 'u1', type: 'url', value: undefined, enabled: true }];

function makeProps(overrides: Partial<Parameters<typeof ToolSidebar>[0]> = {}) {
  return {
    steps: scalarSteps,
    presetsOpen: true,
    onTogglePresets: vi.fn(),
    onAddFilter: vi.fn(),
    onRemoveFilter: vi.fn(),
    onToggleFilter: vi.fn(),
    onUpdateFilter: vi.fn(),
    onApplyPreset: vi.fn(),
    onClearAll: vi.fn(),
    onMoveFilter: vi.fn(),
    onReorderFilter: vi.fn(),
    onResetDefaults: vi.fn(),
    ...overrides,
  };
}

describe('ToolSidebar', () => {
  it('shows the empty state when there are no steps', () => {
    render(<ToolSidebar {...makeProps({ steps: [] })} />);
    expect(screen.getByText(/no filter steps/i)).toBeInTheDocument();
  });

  it('toggles the presets section', () => {
    const onTogglePresets = vi.fn();
    render(<ToolSidebar {...makeProps({ onTogglePresets })} />);
    const header = screen.getByRole('button', { name: /collapse presets section/i });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(header);
    expect(onTogglePresets).toHaveBeenCalled();
  });

  it('applies a preset', () => {
    const onApplyPreset = vi.fn();
    render(<ToolSidebar {...makeProps({ onApplyPreset })} />);
    fireEvent.click(screen.getByRole('button', { name: /apply vintage preset/i }));
    expect(onApplyPreset).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ type: 'sepia' })]),
      'Vintage'
    );
  });

  it('adds filters from the add-filter grid', () => {
    const onAddFilter = vi.fn();
    render(<ToolSidebar {...makeProps({ onAddFilter })} />);
    fireEvent.click(screen.getByRole('button', { name: /add blur filter/i }));
    expect(onAddFilter).toHaveBeenCalledWith('blur');
    fireEvent.click(screen.getByRole('button', { name: /add drop shadow filter/i }));
    expect(onAddFilter).toHaveBeenCalledWith('drop-shadow');
  });

  it('toggles, moves and removes filter steps', () => {
    const onToggleFilter = vi.fn();
    const onMoveFilter = vi.fn();
    const onRemoveFilter = vi.fn();
    render(<ToolSidebar {...makeProps({ onToggleFilter, onMoveFilter, onRemoveFilter })} />);
    // Toggle first step
    fireEvent.click(screen.getByRole('button', { name: /disable blur filter/i }));
    expect(onToggleFilter).toHaveBeenCalledWith('s1');
    // Move up (disabled for first), move down
    const upButtons = screen.getAllByRole('button', { name: /move .* up/i });
    const downButtons = screen.getAllByRole('button', { name: /move .* down/i });
    expect(upButtons[0]!).toBeDisabled();
    fireEvent.click(downButtons[0]!);
    expect(onMoveFilter).toHaveBeenCalledWith('s1', 'down');
    // Remove
    fireEvent.click(screen.getByRole('button', { name: /remove blur filter/i }));
    expect(onRemoveFilter).toHaveBeenCalledWith('s1');
    expect(screen.getByText(/1\/2 active/i)).toBeInTheDocument();
  });

  it('updates scalar filter values via slider', () => {
    const onUpdateFilter = vi.fn();
    render(<ToolSidebar {...makeProps({ onUpdateFilter })} />);
    const slider = screen.getByRole('slider', { name: /blur value/i });
    fireEvent.change(slider, { target: { value: '12' } });
    expect(onUpdateFilter).toHaveBeenCalledWith('s1', 12);
  });

  it('renders and updates drop-shadow controls', () => {
    const onUpdateFilter = vi.fn();
    render(<ToolSidebar {...makeProps({ steps: dropShadowSteps, onUpdateFilter })} />);
    const x = screen.getByRole('slider', { name: /drop shadow x offset/i });
    fireEvent.change(x, { target: { value: '7' } });
    expect(onUpdateFilter).toHaveBeenCalledWith('d1', {
      offsetX: 7,
      offsetY: 2,
      blurRadius: 4,
      color: '#000000',
    } satisfies DropShadowValue);
    const colorHex = screen.getByLabelText('Drop shadow color hex') as HTMLInputElement;
    fireEvent.change(colorHex, { target: { value: '#ff0000' } });
    expect(onUpdateFilter).toHaveBeenCalledWith('d1', {
      offsetX: 2,
      offsetY: 2,
      blurRadius: 4,
      color: '#ff0000',
    });
  });

  it('disables drop-shadow controls when the step is disabled', () => {
    const disabledSteps: FilterStep[] = [
      {
        id: 'd2',
        type: 'drop-shadow',
        value: { offsetX: 1, offsetY: 1, blurRadius: 2, color: '#000000' },
        enabled: false,
      },
    ];
    render(<ToolSidebar {...makeProps({ steps: disabledSteps })} />);
    expect(screen.getByRole('slider', { name: /drop shadow x offset/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /enable drop-shadow filter/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('shows informational text for url steps', () => {
    render(<ToolSidebar {...makeProps({ steps: urlSteps })} />);
    expect(screen.getByText(/svg filter reference/i)).toBeInTheDocument();
    expect(screen.getByText('SVG Filter')).toBeInTheDocument();
  });

  it('clears all filters with a two-step confirmation', () => {
    const onClearAll = vi.fn();
    render(<ToolSidebar {...makeProps({ onClearAll })} />);
    const clearBtn = screen.getByRole('button', { name: /clear all filter steps/i });
    fireEvent.click(clearBtn);
    // First click arms the confirmation — onClearAll not yet called
    expect(onClearAll).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /click again to confirm/i }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('resets to defaults when requested', () => {
    const onResetDefaults = vi.fn();
    render(<ToolSidebar {...makeProps({ onResetDefaults })} />);
    fireEvent.click(screen.getByRole('button', { name: /reset to default filters/i }));
    expect(onResetDefaults).toHaveBeenCalled();
  });

  it('reorders steps via drag and drop', () => {
    const onReorderFilter = vi.fn();
    const { container } = render(<ToolSidebar {...makeProps({ onReorderFilter })} />);
    const items = container.querySelectorAll('li.filter-step-item');
    const source = items[0]!;
    const target = items[1]!;
    const dataTransfer = {
      setData: vi.fn(),
      getData: () => 's1',
      dropEffect: '',
      effectAllowed: '',
    };
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    expect(onReorderFilter).toHaveBeenCalledWith('s1', 's2');
    fireEvent.dragEnd(source);
    fireEvent.dragLeave(target);
  });
});

describe('ToolToolbar', () => {
  it('toggles the shortcuts dropdown', () => {
    const { container } = render(<ToolToolbar />);
    const toggle = screen.getByRole('button', { name: /view keyboard shortcuts/i });
    expect(container.querySelector('.shortcuts-dropdown')).toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector('.shortcuts-dropdown')).not.toBeNull();
    expect(screen.getByRole('button', { name: /close keyboard shortcuts/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close keyboard shortcuts/i }));
    expect(container.querySelector('.shortcuts-dropdown')).toBeNull();
  });

  it('opens the help guide in a new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<ToolToolbar />);
    fireEvent.click(screen.getByRole('button', { name: /open help in new tab/i }));
    expect(openSpy).toHaveBeenCalledWith(
      'https://github.com/ItsJust-tools/css-filter-visualizer/blob/main/GUIDE.md',
      '_blank',
      'noopener,noreferrer'
    );
    openSpy.mockRestore();
  });
});

describe('ToolCanvas extras', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the hint when no filters are active and copies CSS via clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { writable: true, value: { writeText } });
    const state: FilterState = { ...initialState, steps: [] };
    const { container } = render(<ToolCanvas state={state} />);
    expect(container.querySelector('.filter-css-hint')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /copy css rule to clipboard/i }));
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('filter: none;'));
    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: /css copied/i })).toBeInTheDocument()
    );
  });

  it('resets the background color to default and swaps the upload button label', () => {
    const onBaseColorChange = vi.fn();
    const onCustomImageChange = vi.fn();
    const state: FilterState = {
      ...initialState,
      baseColor: '#ff0000',
      customImage: 'data:image/png;base64,xyz',
      customImageName: 'pic.png',
    };
    const { container } = render(
      <ToolCanvas
        state={state}
        onBaseColorChange={onBaseColorChange}
        onCustomImageChange={onCustomImageChange}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /reset background color to default/i }));
    expect(onBaseColorChange).toHaveBeenCalledWith('#6366f1');
    expect(screen.getByRole('button', { name: /replace custom image/i })).toBeInTheDocument();
    // Replace image triggers the hidden file input click
    const input = container.querySelector('#custom-image-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: /replace custom image/i }));
    expect(clickSpy).toHaveBeenCalled();
  });
});
