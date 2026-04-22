'use client';

import type { ToolTheme } from '../../types';

export function ThemeScript({ toolTheme }: { toolTheme?: ToolTheme }) {
  const themeScript = `
    (function() {
      var theme;
      try {
        theme = localStorage.getItem('itsjust-theme');
      } catch(e) {}
      if (theme === 'system' || !theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
    })();
  `;

  const toolThemeScript = toolTheme ? `
    (function() {
      var t = ${JSON.stringify(toolTheme)};
      var r = document.documentElement;
      if (t.accent) r.style.setProperty('--accent', t.accent);
      if (t.accentHover) r.style.setProperty('--accent-hover', t.accentHover);
      if (t.accentSubtle) r.style.setProperty('--accent-subtle', t.accentSubtle);
    })();
  ` : '';

  return <script dangerouslySetInnerHTML={{ __html: themeScript + toolThemeScript }} />;
}