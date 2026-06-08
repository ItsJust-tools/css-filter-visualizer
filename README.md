# CSS Filter Visualizer

[![CI](https://github.com/ItsJust-tools/css-filter-visualizer/actions/workflows/ci.yml/badge.svg)](https://github.com/ItsJust-tools/css-filter-visualizer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Live Site](https://img.shields.io/badge/Live-8b5cf6?style=for-the-badge&logo=vercel&logoColor=white)](https://css-filter-visualizer.itsjust.tools)
[![GitHub](https://img.shields.io/badge/Source-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ItsJust-tools/css-filter-visualizer)

Build and preview CSS filter chains visually. Combine blur, brightness, contrast, saturation, and more — see the result in real time on a colored backdrop with custom text.

**Live at:** [css-filter-visualizer.itsjust.tools](https://css-filter-visualizer.itsjust.tools)

## Features

- **Visual filter chain builder** — Add, remove, toggle, and reorder CSS filters from a list of 10 filter types
  including **drop-shadow** with full X/Y/blur/color controls
- **Real-time preview** — See the combined effect instantly on a colored background with sample text
- **Presets** — One-click presets: Vintage, Vivid, Noir, Dreamy, Dramatic, Frosted Glass
  (the **Frosted Glass** preset demonstrates drop-shadow + blur for a modern UI effect)
- **Adjustable controls** — Fine-tune each filter with range sliders
- **CSS output** — Copy the generated `filter` CSS rule for use in your projects
- **Customizable** — Change the background color and preview text
- **Export** — Save your filter configuration as JSON, PNG, JPEG, WebP, or PDF
- **Shareable URLs** — Share your current filter setup via URL (compressed with LZ-String)
- **Privacy-first** — Everything runs in your browser. No data sent to any server
- **Dark/Light/High-contrast mode** — System preference detection with manual toggle
- **Keyboard shortcuts** — `Ctrl+Shift+N` add filter, `Ctrl+Shift+E` export, `Delete` remove selected
- **Works offline** — PWA-ready for mobile and desktop

## Changelog & What's New

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

---

## Usage

1. **Add a filter** — Click a filter type in the sidebar (Blur, Brightness, Contrast, etc.)
2. **Adjust** — Use the slider to tweak each filter's value
3. **Toggle** — Click the checkbox to enable/disable individual filters
4. **Try presets** — Click a preset button for instant filter combinations
5. **Customize** — Change the background color or preview text
6. **Export** — Use the toolbar to export your configuration or share via URL

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest (unit), Playwright (E2E)
- **Core:** @itsjust/core — shared infrastructure

## Development

```bash
npm install
npm run dev        # Start dev server at http://localhost:3000
npm test           # Run unit tests
npm run test:e2e   # Run E2E tests
npm run build      # Production build
npm run lint       # Lint
```

See [GUIDE.md](./GUIDE.md) for the full walkthrough.

## Deployment

### Vercel

```bash
npx vercel
```

Set `NEXT_PUBLIC_URL` in your Vercel project settings.

## License

MIT © ItsJust-tools
