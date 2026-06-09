# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
