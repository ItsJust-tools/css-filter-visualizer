# CSS Filter Visualizer — Developer Guide

A single-purpose tool for visually building and previewing CSS filter chains.

## Quick Start

```bash
git clone https://github.com/ItsJust-tools/css-filter-visualizer.git
cd css-filter-visualizer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the tool.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Tool main page
│   ├── tool-client.tsx     # Main client component
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles + CSS variables
│   └── ...
├── tool/                   # Tool-specific code
│   ├── tool.config.ts      # Tool metadata & configuration
│   ├── tool-definition.ts  # State shape, serialization, filter builder
│   ├── template-metadata.ts # SEO & PWA metadata
│   ├── types.ts            # Filter types, presets, constants
│   ├── index.ts            # Public exports
│   ├── components/
│   │   ├── tool-canvas.tsx  # Preview panel with color/text controls
│   │   ├── tool-toolbar.tsx # Toolbar links
│   │   └── tool-sidebar.tsx # Filter list, presets, add/remove controls
│   └── exporters/          # Image/PDF export modules
└── __tests__/              # Unit & E2E tests
```

## Filter Types

| Filter        | Range     | Unit  | Default |
|---------------|-----------|-------|---------|
| blur          | 0–20      | px    | 5       |
| brightness    | 0–200     | %     | 150     |
| contrast      | 0–200     | %     | 150     |
| grayscale     | 0–100     | %     | 100     |
| hue-rotate    | 0–360     | deg   | 180     |
| invert        | 0–100     | %     | 100     |
| opacity       | 0–100     | %     | 50      |
| saturate      | 0–300     | %     | 200     |
| sepia         | 0–100     | %     | 100     |
| drop-shadow   | —         | —     | —       |

## Building the Filter CSS

The `buildFilterCss()` function in `tool-definition.ts` converts the filter state into a valid CSS `filter` property value:

```ts
buildFilterCss(steps)
// Returns: "brightness(120%) contrast(140%) saturate(180%)"
```

## Presets

Pre-defined filter combinations are in `types.ts`:

- **Vintage** — sepia + contrast + brightness
- **Vivid** — saturate + contrast + brightness
- **Noir** — grayscale + contrast + brightness
- **Dreamy** — blur + brightness + sepia
- **Dramatic** — contrast + brightness + saturate

## Testing

```bash
npm test              # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
npm run test:e2e:dev  # Playwright UI mode
```

## License

MIT
