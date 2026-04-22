# itsjust Template — Developer Guide

This guide walks you through creating a new tool with the itsjust template.

## Table of Contents

1. [Philosophy](#philosophy)
2. [Quick Start](#quick-start)
3. [The Tool Contract](#the-tool-contract)
4. [Tool Configuration](#tool-configuration)
5. [State Management](#state-management)
6. [Canvas, Toolbar & Sidebar](#canvas-toolbar--sidebar)
7. [Export & Import](#export--import)
8. [Share](#share)
9. [Styling](#styling)
10. [SEO & Metadata](#seo--metadata)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## Philosophy

Each itsjust tool does **one thing** and does it well. No bloat, no signups, no confusing menus. Think:

- UML Activity Diagram Maker
- Pixel Art Editor
- Color Palette Generator
- ASCII Table Builder

Not: "All-in-one design suite".

---

## Quick Start

```bash
# 1. Create your repo from this template
git clone https://github.com/YOU/your-tool.git
cd your-tool
npm install

# 2. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## The Tool Contract

Every tool must implement the `Tool` interface from `@itsjust/core`:

```ts
import type { Tool } from '@itsjust/core';

export const myTool: Tool<MyState> = {
  id: 'pixel-art',
  name: 'Pixel Art',
  version: '1.0.0',
  config: toolConfig,
  initialState: { grid: [], color: '#000' },
  serialize: (state) => JSON.stringify(state),
  deserialize: (data) => {
    // Validate and parse imported data
    if (typeof data !== 'object' || data === null) return { grid: [], color: '#000' };
    const record = data as Record<string, unknown>;
    return {
      grid: Array.isArray(record.grid) ? record.grid : [],
      color: typeof record.color === 'string' ? record.color : '#000',
    };
  },
};
```

| Field | Purpose |
|-------|---------|
| `id` | Storage key prefix, share file identifier |
| `name` | Human-readable name |
| `version` | Share file schema version |
| `config` | `ToolConfig` — features, export formats, theme |
| `initialState` | State when the tool first loads |
| `serialize` | Convert state to string for export/share |
| `deserialize` | Recover state from imported data |

### Why a contract?

The contract lets `useTool()` handle all the boring stuff — undo/redo, auto-save, export, import, share — so you only write the code that's unique to your tool.

---

## Tool Configuration

Edit `src/tool/tool.config.ts`:

```ts
const toolConfig: ToolConfig = {
  id: 'pixel-art',
  name: 'Pixel Art',
  description: 'Create pixel art in your browser',
  version: '1.0.0',
  exportFormats: ['json'],
  features: {
    export: true,
    autoSave: true,
    undoRedo: true,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: {
    accent: '#ef4444',
    accentHover: '#dc2626',
    accentSubtle: 'rgba(239, 68, 68, 0.08)',
    brand: 'Pixel Art',
    icon: '🎨',
  },
};
```

Toggle `features` to enable/disable UI sections. If `sidebar: false`, the sidebar toggle button and resize handle disappear automatically.

---

## State Management

`useTool()` returns a `state` object powered by `useToolState`:

```ts
const tool = useTool(myTool, canvasRef);

tool.state.data        // current state
tool.state.setData(updater)   // update state (debounced history)
tool.state.undo()      // undo
tool.state.redo()      // redo
tool.state.canUndo     // boolean
tool.state.canRedo     // boolean
tool.state.isDirty     // unsaved changes?
tool.state.lastSaved   // Date | null
```

### Wiring it up in `tool-client.tsx`

```tsx
export default function ToolClient() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tool = useTool(myTool, canvasRef);
  const [sidebarOpen, setSidebarOpen] = useState(toolConfig.features.sidebar);

  return (
    <ToolShell config={toolConfig} actions={tool.toolbarActions}>
      <ToolShell.Toolbar>
        <ToolToolbar state={tool.state.data} />
        <ImportExport formats={tool.supportedFormats} onExport={tool.handleExport} onImport={tool.importFromFile} />
      </ToolShell.Toolbar>
      <ToolShell.Body>
        <ToolShell.Sidebar>
          <ToolSidebar state={tool.state.data} />
        </ToolShell.Sidebar>
        <ToolShell.Canvas>
          <ToolCanvas canvasRef={canvasRef} state={tool.state.data} />
        </ToolShell.Canvas>
      </ToolShell.Body>
    </ToolShell>
  );
}
```

---

## Canvas, Toolbar & Sidebar

### Canvas

The canvas is where your tool lives. It receives:
- `canvasRef` — needed for PNG/JPEG/WebP/PDF export (html2canvas captures this element)
- `state` — current tool state
- `logic` — tool-specific action creators

```tsx
export function ToolCanvas({ canvasRef, state, logic }: ToolCanvasProps) {
  return (
    <div ref={canvasRef} className="my-canvas">
      {/* Your tool UI */}
    </div>
  );
}
```

**Important:** Wrap your actual UI in a `div` with `ref={canvasRef}` if you want image/PDF export to work. Text-based exports (JSON, SVG) use `serialize()` instead.

### Toolbar

Add buttons between the brand and the built-in Export/Share buttons:

```tsx
export function ToolToolbar({ state, logic }: ToolToolbarProps) {
  return (
    <div className="tool-toolbar-items">
      <button onClick={logic.clearCanvas}>Clear</button>
      <button onClick={logic.downloadPattern}>Pattern</button>
    </div>
  );
}
```

### Sidebar

The sidebar is resizable (drag the right edge) and collapsible (Ctrl+B or the toolbar button). Put tool options here:

```tsx
export function ToolSidebar({ state, logic }: ToolSidebarProps) {
  return (
    <div className="tool-sidebar">
      <label>Brush size</label>
      <input type="range" min="1" max="10" />
    </div>
  );
}
```

---

## Export & Import

### Supported Formats

| Format | How it works | Requires canvas ref |
|--------|-------------|---------------------|
| `json` | `serialize(state)` | No |
| `png`  | html2canvas + canvas.toBlob | Yes |
| `jpeg` | html2canvas + canvas.toBlob | Yes |
| `webp` | html2canvas + canvas.toBlob | Yes |
| `pdf`  | html2canvas + jsPDF | Yes |

> **Note:** Image and PDF exporters are lazy-loaded at the app level. The core package only bundles `jsonExporter`. Add your own exporters in `src/tool/exporters/` and register them via `registerExporterLoader()`.

Set `exportFormats` in `tool.config.ts` to control which formats appear in the Export dropdown.

### Custom serialization

`serialize` and `deserialize` in your `Tool` contract control JSON export/import:

```ts
serialize: (state) => JSON.stringify({ pixels: state.grid, palette: state.palette }),
deserialize: (data) => {
  const record = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
  return {
    grid: Array.isArray(record.pixels) ? record.pixels : [],
    palette: Array.isArray(record.palette) ? record.palette : ['#000'],
  };
},
```

### .itsjust.json files

The share format is automatically handled by `useTool`. Users can import `.itsjust.json` files created by any itsjust tool. The framework validates `$schema: 'itsjust-tool'` and calls your `deserialize` with the `content` field.

---

## Share

Share methods are provided by `useShare` from `@itsjust/core`:

1. **Download .itsjust.json** — `downloadShareFile()`
2. **Web Share API** — `shareViaWeb()` (opens native share sheet on mobile)
3. **Copy to Clipboard** — `copyShareToClipboard()`

All are 100% client-side. No server required.

---

## Styling

### Global theme

Edit CSS custom properties in `src/app/globals.css`:

```css
:root {
  --accent: #ef4444;
  --accent-hover: #dc2626;
  --background: #f1f5f9;
  /* ... */
}
```

### Tool-specific styles

Add tool-specific CSS to `src/app/globals.css`:

```css
.my-canvas {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 1px;
}

.my-pixel {
  aspect-ratio: 1;
  border: 1px solid var(--border);
}
```

### Dark mode

Dark mode variables are in the `[data-theme='dark']` block in `globals.css`. The framework handles toggling automatically — you don't need to write any dark mode logic.

---

## SEO & Metadata

Edit `src/lib/seo.ts`:

```ts
export function generateToolMetadata(config: ToolConfig): Metadata {
  return {
    title: config.name,
    description: config.description,
    openGraph: {
      title: config.name,
      description: config.description,
      images: ['/og.png'],
    },
  };
}
```

Replace `public/og.svg` with your tool's Open Graph image (1200x630px).

---

## Testing

### Unit tests

Test your tool logic with Vitest:

```ts
// __tests__/unit/tool/pixel-art.test.ts
import { describe, it, expect } from 'vitest';

function setPixel(grid: string[][], x: number, y: number, color: string) {
  return grid.map((row, ry) =>
    ry === y ? row.map((c, rx) => (rx === x ? color : c)) : row
  );
}

describe('setPixel', () => {
  it('changes the color at the given coordinate', () => {
    const grid = [['#fff', '#fff'], ['#fff', '#fff']];
    expect(setPixel(grid, 0, 1, '#f00')).toEqual([['#fff', '#fff'], ['#f00', '#fff']]);
  });
});
```

### Component tests

Use `@itsjust/core/testing`:

```ts
import { renderTool } from '@itsjust/core/testing';

test('canvas renders', () => {
  renderTool(<ToolCanvas state={initialState} logic={mockLogic} />);
  expect(screen.getByRole('main')).toBeInTheDocument();
});
```

### E2E tests

Playwright tests live in `__tests__/e2e/`:

```ts
// __tests__/e2e/tool.spec.ts
import { test, expect } from '@playwright/test';

test('exports json', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Export');
  await page.click('text=JSON Data');
  // assert download
});
```

---

## Deployment

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Set `NEXT_PUBLIC_URL` (optional but recommended)
4. Done — zero build config needed

For server-based sharing, add `BLOB_READ_WRITE_TOKEN` in Vercel Environment Variables.

---

## Common Patterns

### Adding a keyboard shortcut

Keyboard shortcuts are handled via the `ToolConfig.shortcuts` array and the built-in `useKeyboardShortcuts` hook. Add shortcuts to your `tool.config.ts`:

```ts
shortcuts: [
  {
    group: 'Actions',
    shortcuts: [
      { label: 'Fill canvas', keys: 'Ctrl+F', action: () => logic.fillCanvas() },
    ],
  },
],
```

### Custom export handler

If you need custom export logic beyond `serialize`, use `useExport` directly:

```tsx
const { exportTo } = useExport(canvasRef, toolConfig, () => myCustomSerializer(state));
```

### Disabling features per tool

Just set `features: { sidebar: false }` in `tool.config.ts`. The UI adapts automatically.

---

## Troubleshooting

### Export produces blank image

Make sure `canvasRef` is attached to the element you want to capture. html2canvas can't capture elements outside the viewport or with `display: none`.

### Hydration mismatch

Don't read `window` or `localStorage` during render. Use `useEffect` or the lazy initializer pattern shown in `ThemeToggle`.

### Tests fail with "scrollIntoView is not a function"

Mock it in your test setup:

```ts
Element.prototype.scrollIntoView = vi.fn();
```

### Tests fail with "file.text is not a function"

The jsdom environment doesn't implement `Blob.prototype.text`. The template already polyfills this in `vitest.setup.ts`.

---

## File Checklist for a New Tool

- [ ] `src/tool/tool.config.ts` — id, name, features, theme
- [ ] `src/tool/tool-definition.ts` — `Tool` contract (serialize, deserialize)
- [ ] `src/tool/types.ts` — your tool's state type
- [ ] `src/tool/components/tool-canvas.tsx` — main UI
- [ ] `src/tool/components/tool-toolbar.tsx` — extra toolbar buttons
- [ ] `src/tool/components/tool-sidebar.tsx` — options panel
- [ ] `src/app/tool-client.tsx` — wire everything together
- [ ] `src/app/page.tsx` — SEO metadata
- [ ] `src/app/manifest.ts` — PWA manifest
- [ ] `src/lib/seo.ts` — keywords, description
- [ ] `public/og.svg` — Open Graph image
- [ ] `__tests__/unit/tool/` — unit tests
- [ ] `__tests__/e2e/tool.spec.ts` — E2E tests

That's it. One tool, one purpose, no bloat.
