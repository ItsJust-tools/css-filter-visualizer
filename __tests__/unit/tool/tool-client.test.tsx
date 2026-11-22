import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import ToolClient from '@/app/tool-client';
import ToolClientWrapper from '@/app/tool-client-wrapper';
import { initialState, cssFilterTool } from '@/tool/tool-definition';
import { ToastProvider } from '@itsjust/core';
import { compressToEncodedURIComponent } from 'lz-string';
import type { FilterState } from '@/tool/types';

vi.mock('next/dynamic', async () => {
  // next/dynamic is used solely for code-splitting in the app; in jsdom tests
  // render the actual component synchronously so the wrapper's wiring is
  // exercised without an async loader state machine.
  const mod = await vi.importActual<typeof import('@/app/tool-client')>('@/app/tool-client');
  return {
    default: (_loader: () => Promise<{ default: React.ComponentType }>) => mod.default,
  };
});

// Use the real useTool/useToolState (coverage), but replace the shell chrome
// with lightweight pass-throughs so we can drive and assert on state.
vi.mock('@itsjust/core', async () => {
  const actual = await vi.importActual<typeof import('@itsjust/core')>('@itsjust/core');
  return {
    ...actual,
    ToolShell: ({
      toolbar,
      sidebar,
      canvas,
      statusBar,
      sidebarOpen,
      actions,
    }: {
      toolbar?: ReactNode;
      sidebar?: ReactNode;
      canvas?: ReactNode;
      statusBar?: ReactNode;
      sidebarOpen?: boolean;
      actions?: Record<string, unknown>;
    }) => (
      <div data-testid="shell" data-sidebar={sidebarOpen ? 'open' : 'collapsed'}>
        <div data-region="sidebar">{sidebar}</div>
        <div data-region="toolbar">
          {/* Mirrors the brand UI of the real core Toolbar, driven by tool-client's toolbarActions */}
          {actions?.isBrandEditing ? (
            <input
              aria-label="Rename"
              value={(actions.brandValue as string | undefined) ?? ''}
              onChange={(e) => (actions.onBrandChange as (v: string) => void)?.(e.target.value)}
              onBlur={() => (actions.onBrandCommit as () => void)?.()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (actions.onBrandCommit as () => void)?.();
                if (e.key === 'Escape') (actions.onBrandCancel as () => void)?.();
              }}
            />
          ) : (
            <button
              type="button"
              aria-label="Rename"
              onClick={() => (actions?.onBrandClick as () => void)?.()}
            >
              {(actions?.brandValue as string | undefined) ?? 'Brand'}
            </button>
          )}
          {toolbar}
        </div>
        <div data-region="canvas">{canvas}</div>
        <div data-region="statusbar">{statusBar}</div>
      </div>
    ),
    ImportExport: ({ onShare }: { onShare?: () => void }) => (
      <button type="button" onClick={() => void onShare?.()}>
        mock-share
      </button>
    ),
  };
});

function sharedUrl(state: FilterState): string {
  return `/?state=${compressToEncodedURIComponent(cssFilterTool.serialize(state))}`;
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
}

function key(opts: { key: string; ctrl?: boolean; shift?: boolean }) {
  return new KeyboardEvent('keydown', {
    key: opts.key,
    ctrlKey: opts.ctrl ?? false,
    metaKey: false,
    shiftKey: opts.shift ?? false,
  });
}

function activeFilterCount(): number {
  const status = document.querySelector('[data-region=statusbar]')!;
  return Number(status.textContent!.match(/(\d+) filters active/)![1]);
}

describe('ToolClient integration (real useTool state)', () => {
  let matchMediaSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    setViewportWidth(1024);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList
    );
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    vi.stubGlobal('crypto', {
      ...crypto,
      randomUUID: () => `uuid-${Math.random().toString(36).slice(2)}`,
    });
  });

  afterEach(() => {
    matchMediaSpy?.mockRestore();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('loads state from a shared URL on mount', async () => {
    const state: FilterState = {
      ...initialState,
      previewText: 'From Shared Url',
      presetName: 'Vintage',
    };
    window.history.replaceState(null, '', sharedUrl(state));
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    expect(await screen.findByText('Loaded state from shared URL')).toBeInTheDocument();
    expect(screen.getByText('From Shared Url')).toBeInTheDocument();
  });

  it('toasts an error for a corrupt shared URL', async () => {
    window.history.replaceState(null, '', '/?state=%25zz-corrupt');
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const alert = await screen.findByRole('alert', {}, { timeout: 4000 });
    expect(alert.textContent).toBeTruthy();
  });

  it('adds a blur filter via Ctrl+Shift+N and shows the toast', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const before = activeFilterCount();
    await act(async () => {
      window.dispatchEvent(key({ key: 'N', ctrl: true, shift: true }));
    });
    expect(await screen.findByText('Added Blur filter')).toBeInTheDocument();
    expect(activeFilterCount()).toBe(before + 1);
  });

  it('undoes and redoes via Ctrl+Z / Ctrl+Shift+Z', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const before = activeFilterCount();
    await act(async () => {
      window.dispatchEvent(key({ key: 'N', ctrl: true, shift: true }));
    });
    expect(activeFilterCount()).toBe(before + 1);
    await act(async () => {
      window.dispatchEvent(key({ key: 'z', ctrl: true }));
    });
    expect(activeFilterCount()).toBe(before);
    await act(async () => {
      window.dispatchEvent(key({ key: 'Z', ctrl: true, shift: true }));
    });
    expect(activeFilterCount()).toBe(before + 1);
  });

  it('removes the last filter with the Delete key', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const before = activeFilterCount();
    await act(async () => {
      window.dispatchEvent(key({ key: 'Delete' }));
    });
    expect(activeFilterCount()).toBe(before - 1);
  });

  it('does not remove filters when an input is focused', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const before = activeFilterCount();
    const textInput = screen.getByLabelText('Preview text');
    await act(async () => {
      fireEvent.keyDown(textInput, { key: 'Delete' });
    });
    expect(activeFilterCount()).toBe(before);
  });

  it('cycles presets with Ctrl+Shift+P', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    await act(async () => {
      window.dispatchEvent(key({ key: 'P', ctrl: true, shift: true }));
    });
    expect(await screen.findByText('Preset: Vintage')).toBeInTheDocument();
  });

  it('moves the last filter with Ctrl+Shift+ArrowUp and updates the CSS order', async () => {
    const state: FilterState = {
      steps: [
        { id: 'a1', type: 'blur', value: 3, enabled: true },
        { id: 'a2', type: 'sepia', value: 20, enabled: true },
      ],
      baseColor: '#6366f1',
      previewText: 'x',
      presetName: '',
    };
    window.history.replaceState(null, '', sharedUrl(state));
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const cssOut = () => screen.getByText(/filter: /, { selector: 'code' });
    await waitFor(() => expect(cssOut().textContent).toContain('blur(3px) sepia(20%)'));
    await act(async () => {
      window.dispatchEvent(key({ key: 'ArrowUp', ctrl: true, shift: true }));
    });
    await waitFor(() => expect(cssOut().textContent).toContain('sepia(20%) blur(3px)'));
  });

  it('shares the current state and copies the URL to the clipboard', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText('mock-share'));
    });
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('state='))
    );
    expect(screen.getByText('Share URL copied to clipboard')).toBeInTheDocument();
    expect(window.location.search).toContain('state=');
    expect(window.location.search).toContain('tool=css-filter-visualizer');
  });

  it('silently returns when the native share sheet is aborted', async () => {
    const abort = () => {
      const err = new DOMException('aborted', 'AbortError');
      return Promise.reject(err);
    };
    Object.defineProperty(navigator, 'share', { writable: true, configurable: true, value: abort });
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText('mock-share'));
    });
    await waitFor(() => expect(window.location.search).toContain('state='));
    // Abort path: no copy attempt, no error toast
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('closes the sidebar when the window shrinks to a narrow width', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    expect(screen.getByTestId('shell')).toHaveAttribute('data-sidebar', 'open');
    setViewportWidth(500);
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.getByTestId('shell')).toHaveAttribute('data-sidebar', 'collapsed');
  });

  it('updates base color and preview text from the canvas controls', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const colorText = screen.getByLabelText('Color hex value');
    await act(async () => {
      fireEvent.change(colorText, { target: { value: '#ff0000' } });
    });
    const textInput = screen.getByLabelText('Preview text');
    await act(async () => {
      fireEvent.change(textInput, { target: { value: 'Hello World' } });
    });
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('loads and removes a custom image through the canvas upload', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const input = document.querySelector('#custom-image-input') as HTMLInputElement;
    const file = new File(['img'], 'pic.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText('Custom image loaded')).toBeInTheDocument();
    const removeBtn = screen.getByRole('button', { name: /remove custom image/i });
    await act(async () => {
      fireEvent.click(removeBtn);
    });
    expect(screen.getByText('Custom image removed')).toBeInTheDocument();
  });

  it('edits the brand name and commits or cancels the edit', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const brand = screen.getByRole('button', { name: /rename/i });
    await act(async () => {
      fireEvent.click(brand);
    });
    const brandInput = screen.getByRole('textbox', { name: /rename/i });
    await act(async () => {
      fireEvent.change(brandInput, { target: { value: 'My Filters' } });
    });
    expect(screen.getByRole('textbox', { name: /rename/i })).toHaveValue('My Filters');
    await act(async () => {
      fireEvent.keyDown(brandInput, { key: 'Enter' });
    });
    // Commit exits edit mode; the toolbar brand shows the configured tool name
    expect(screen.getByRole('button', { name: /rename/i }).textContent).toContain(
      'CSS Filter Visualizer'
    );

    // Start again and cancel with Escape
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /rename/i }));
    });
    const input2 = screen.getByRole('textbox', { name: /rename/i });
    await act(async () => {
      fireEvent.change(input2, { target: { value: 'Changed' } });
    });
    await act(async () => {
      fireEvent.keyDown(input2, { key: 'Escape' });
    });
    expect(screen.getByRole('button', { name: /rename/i }).textContent).toContain(
      'CSS Filter Visualizer'
    );
  });

  it('shows save state and template info in the status bar', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const status = screen.getByTestId('shell').querySelector('[data-region=statusbar]')!;
    expect(status.textContent).toContain('filters active');
    expect(status.textContent).toContain('Tool v');
    expect(status.textContent).toContain('Template v');
  });

  it('clears all filters via the sidebar two-step confirm', async () => {
    render(
      <ToastProvider>
        <ToolClient />
      </ToastProvider>
    );
    const before = activeFilterCount();
    expect(before).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /clear all filter steps/i }));
    fireEvent.click(screen.getByRole('button', { name: /click again to confirm/i }));
    await waitFor(() => expect(activeFilterCount()).toBe(0));
    expect(screen.getByText('All filters cleared')).toBeInTheDocument();
  });
});

describe('ToolClientWrapper', () => {
  it('renders the dynamically imported tool client', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    render(
      <ToastProvider>
        <ToolClientWrapper />
      </ToastProvider>
    );
    expect(await screen.findByText(/css filter visualizer/i)).toBeInTheDocument();
  });
});
