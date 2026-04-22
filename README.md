# itsjust — Single-Purpose Tool Template

[![Use this template](https://img.shields.io/badge/Use%20this%20template-2ea043?style=for-the-badge&logo=github&logoColor=white)](https://github.com/entcheneric/template/generate)

A Next.js template for building specialized single-purpose web tools. Each tool does ONE thing well — no bloat, no signups, no confusing menus.

**Live example:** [itsjust.tools](https://itsjust.tools)

## Why?

Multi-purpose tools (UML generators, diagram apps, paint programs) are bloated and confusing. itsjust tools do one thing and do it well. Want a UML activity diagram maker? It makes UML activity diagrams. Nothing else. Want a pixel art editor? It edits pixels. Clean, focused, fast.

## Quick Start

Click **"Use this template"** above, or:

```bash
git clone https://github.com/entcheneric/template.git my-tool
cd my-tool
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the example notepad tool.

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── page.tsx          # Tool main page (Server Component + SEO)
│   ├── tool-client.tsx   # Tool client logic
│   ├── sitemap.ts        # Auto-generated sitemap
│   ├── robots.ts         # robots.txt
│   └── not-found.tsx     # Custom 404
├── tool/             # Tool-specific code (customize this!)
│   ├── tool.config.ts    # Tool metadata, features, export formats
│   ├── tool-definition.ts # Tool contract (state, serialize, deserialize)
│   ├── components/       # Canvas, Toolbar, Sidebar
│   └── exporters/        # Optional lazy-loaded exporters (png, pdf, ...)
├── lib/
│   ├── seo.ts            # Metadata, OG tags, JSON-LD generators
│   └── utils.ts          # Utilities (cn())

packages/core/        # @itsjust/core — shared infrastructure
├── src/
│   ├── types/            # ToolConfig, ExportFormat, ShareData, etc.
│   ├── components/       # ToolShell, ThemeProvider
│   ├── hooks/            # useTool, useToolState, useExport, useShare
│   ├── engines/          # ExportEngine, StorageManager
│   └── testing/          # renderTool(), createMockToolState()
└── __tests__/            # Core package unit tests
__tests__/
├── unit/            # Vitest unit tests
└── e2e/             # Playwright E2E tests
```

## Creating a New Tool

1. **Click "Use this template"** on GitHub to create your repo
2. Edit `src/tool/tool.config.ts` — set id, name, export formats, features
3. Replace `src/tool/tool-definition.ts` — implement the `Tool` contract (state, serialize, deserialize)
4. Replace components in `src/tool/components/` — canvas, toolbar, sidebar
5. Update `src/app/page.tsx` and `src/app/tool-client.tsx` — wire your components
6. Update `src/lib/seo.ts` — adjust keywords and metadata
7. Replace `public/og.svg` — your tool's Open Graph image
8. Update `src/app/manifest.ts` — your tool's name and description

See [GUIDE.md](./GUIDE.md) for the full walkthrough.

## Features

- **SEO** — Metadata, Open Graph, Twitter Cards, JSON-LD, sitemap, robots.txt, canonical URLs
- **Undo/Redo** via `useToolState` hook (max 50 entries)
- **Auto-Save** to localStorage with debounce
- **Export** to PNG, JPEG, WebP, PDF, JSON (100% client-side, lazy-loaded)
- **Import** from JSON and `.itsjust.json` share files (100% client-side)
- **Share** via file download, Web Share API, or clipboard — no server required
- **Dark/Light mode** with system preference detection
- **PWA-ready** — Web App Manifest included

## Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Build core package + Next.js |
| `npm test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Run ESLint |

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_URL` | Public URL (e.g. `https://your-tool.vercel.app`) | No (defaults to localhost) |

> **Note:** All features work 100% client-side without any environment variables.

## Deployment

Push to GitHub and connect to [Vercel](https://vercel.com) — zero config needed. Set the environment variables in your Vercel project settings.

## License

MIT