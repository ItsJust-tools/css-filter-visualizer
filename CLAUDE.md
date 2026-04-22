# itsjust Template — AI Assistant Guide

## Project Overview

Single-purpose web tool template built with Next.js App Router. Each tool does ONE thing well — no bloat, no signups.

**Live example:** [itsjust.tools](https://itsjust.tools)

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4, shadcn-style components
- **State:** `useToolState` hook (custom, with undo/redo)
- **Testing:** Vitest (unit), Playwright (E2E)
- **Deployment:** Vercel (zero config)

## Monorepo Structure

```
template/
├── src/                      # App source code
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Tool page (Server Component)
│   │   ├── tool-client.tsx   # Client component (main logic)
│   ├── tool/                 # Tool-specific code (CUSTOMIZE THIS)
│   │   ├── tool.config.ts    # Tool metadata & features
│   │   ├── components/       # Canvas, Toolbar, Sidebar
│   │   └── hooks/            # Tool logic (useNotepadLogic)
│   └── lib/                  # Utilities (seo.ts, utils.ts)
├── packages/core/            # @itsjust/core (shared)
│   ├── src/
│   │   ├── types/            # ToolConfig, ExportFormat, etc.
│   │   ├── components/       # ToolShell, ThemeProvider
│   │   ├── hooks/            # useToolState, useExport, useShare
│   │   └── engines/          # Export, Storage, Share managers
│   └── __tests__/            # Core unit tests
```

## Creating a New Tool

1. Edit `src/tool/tool.config.ts` — set id, name, export formats
2. Replace `src/tool/components/` — canvas, toolbar, sidebar
3. Wire up `src/app/page.tsx` and `src/app/tool-client.tsx`
4. Update `src/lib/seo.ts` — metadata for your tool

## Key Patterns

### Import/Export System (100% Client-Side)

Alles läuft im Browser - kein Server, keine API-Calls:

```tsx
const { exportTo } = useExport(canvasRef, toolConfig, serialize);
const { importFromFile } = useImport({
  acceptedFormats: ['json'],
  onImport: (result) => {
    if (result.success) {
      // result.data enthält den Inhalt
      // result.isItsJustFile zeigt .itsjust.json Dateien an
    }
  },
});

// Export
exportTo('png'); // oder jpeg, webp, svg, pdf, json

// Import via File Input
<input type="file" accept=".itsjust.json,.json" onChange={(e) => importFromFile(e.target.files[0])} />

// Import via Drag & Drop (selber machen)
```

**Unterstützte Formate:**
- `.itsjust.json` - Share-Format (wird automatisch erkannt)
- `.json` - JSON Export/Import
- `.png`, `.jpeg`, `.webp` - Bild-Export (html2canvas, lazy-loaded)
- `.pdf` - PDF-Export (jspdf, lazy-loaded)

```tsx
<ToolShell config={toolConfig} actions={toolbarActions}>
  <ToolShell.Toolbar>
    <ToolToolbar state={state} />
  </ToolShell.Toolbar>
  <ToolShell.Body>
    <ToolShell.Sidebar>
      <ToolSidebar />
    </ToolShell.Sidebar>
    <ToolShell.Canvas>
      <ToolCanvas />
    </ToolShell.Canvas>
  </ToolShell.Body>
  <ToolShell.StatusBar>
    <span>Status</span>
  </ToolShell.StatusBar>
</ToolShell>
```

### useToolState Hook

Provides undo/redo, auto-save, dirty state:

```tsx
const state = useToolState<NotepadState>(initialState, {
  key: 'my-tool',
  maxHistory: 50,
  autoSaveDelay: 1000,
});

state.setData((prev) => ({ ...prev, text: 'new' }));
state.undo();
state.redo();
```

### Export System

Client-side export via `useExport`:

```tsx
const { exportTo, supportedFormats } = useExport(canvasRef, toolConfig, serialize);
exportTo('png'); // or jpeg, webp, svg, pdf, json
```

### Share System (100% Client-Side)

Kein Server nötig - Files werden direkt im Browser erzeugt:

```tsx
const { downloadShareFile, shareViaWeb } = useShare();

// Download als .itsjust.json Datei
await downloadShareFile({
  toolId: 'my-tool',
  content: serialize(),
  metadata: { schemaVersion: '1.0' },
});

// Web Share API (System-Dialog)
await shareViaWeb({
  toolId: 'my-tool',
  content: serialize(),
  metadata: { schemaVersion: '1.0' },
});
```

**.itsjust.json Format:**
```json
{
  "$schema": "itsjust-tool",
  "toolId": "simple-notepad",
  "version": "1.0",
  "content": { "text": "...", "fontSize": 16 },
  "createdAt": "2026-04-22T..."
}
```

## Environment Variables

```bash
NEXT_PUBLIC_URL=https://your-tool.vercel.app
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Build core + Next.js |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |

## Important Conventions

- **No premature abstraction** — 3 similar lines > wrong abstraction
- **Client-side only** — no server-side processing for tool logic
- **Zero signup** — tools work immediately, no auth required
- **Print-friendly** — CSS hides UI chrome when printing
- **Mobile-first** — toolbar icons only on mobile, full labels on desktop
- **Accessibility** — all buttons have aria-label, keyboard navigation works

## Common Pitfalls

- Don't use `useEffect` for state updates — use `useCallback` with handlers
- Don't access `window` without `typeof window !== 'undefined'` check
- Don't commit `.env` files — use `.env.example` as template
- Don't add server dependencies to tool logic — keep it client-side

## Testing

- Unit tests in `packages/core/__tests__/` and `__tests__/unit/`
- E2E tests in `__tests__/e2e/`
- Use `renderTool()` from `@itsjust/core/testing` for component tests

## Deployment

Push to GitHub → Connect to Vercel → Set env vars → Done.

No build config needed — `next.config.ts` handles everything.
