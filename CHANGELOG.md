# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-06-09

### Added

- `src/tool/lib/color-utils.ts` — extracted `hexToRgb`, `hexLuminance`, and `previewTextColor`
  from `tool-canvas.tsx` into a testable utility module with 24 unit tests covering
  parsing, luminance calculation, and text-color contrast logic.
- `src/tool/lib/utils.ts` — extracted shared `generateId()` to eliminate the duplicate
  ID-generation logic between `types.ts` (`createFilterStep`) and `tool-client.tsx`.

### Changed

- `src/tool/components/tool-canvas.tsx` — now imports color utilities from `@/tool/lib/color-utils`
  instead of defining them as local functions.
- `src/tool/index.ts` — exports `hexToRgb`, `hexLuminance`, `previewTextColor`, and `generateId`.

### Internal

- Removed duplicate `generateId()` function from `src/app/tool-client.tsx`;
  both `handleAddFilter` and `handleApplyPreset` now use the shared implementation
  from `@/tool/lib/utils`.

## [Unreleased]

### Added

- Filter chain reordering: move individual filter steps up/down with ▲/▼ buttons
  - Filter order now controllable — CSS filter chains are order-sensitive for visual results
- Move filter step unit tests (up, down, boundary checks, CSS output order verification)
- Keyboard shortcuts: Ctrl+Shift+↑ (Move Up) and Ctrl+Shift+↓ (Move Down)

## [1.0.0] - 2026-05-24

### Added

- Initial release of CSS Filter Visualizer
- Visual filter chain builder with 10 CSS filter types (blur, brightness, contrast, grayscale, hue-rotate, invert, opacity, saturate, sepia, drop-shadow)
- Real-time preview on customizable background color with sample text
- 5 preset filter combinations: Vintage, Vivid, Noir, Dreamy, Dramatic
- Per-filter toggle and slider control
- CSS output: real-time generated `filter` CSS rule
- Export to JSON, PNG, JPEG, WebP, PDF
- Shareable URLs with compressed state
- Dark/Light/High-contrast mode support
- PWA-ready with manifest
- Full accessibility support
