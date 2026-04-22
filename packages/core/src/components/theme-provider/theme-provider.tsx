'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ToolTheme } from '../../types';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
});

const STORAGE_KEY = 'itsjust-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
}

function applyToolTheme(toolTheme: ToolTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (toolTheme.accent) root.style.setProperty('--accent', toolTheme.accent);
  if (toolTheme.accentHover) root.style.setProperty('--accent-hover', toolTheme.accentHover);
  if (toolTheme.accentSubtle) root.style.setProperty('--accent-subtle', toolTheme.accentSubtle);
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {}
  return 'system';
}

export function ThemeProvider({ children, toolTheme }: { children: React.ReactNode; toolTheme?: ToolTheme }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const initial = getInitialTheme();
    return initial === 'system' ? getSystemTheme() : initial;
  });

  const resolveTheme = useCallback(
    (t: Theme) => (t === 'system' ? getSystemTheme() : t),
    [],
  );

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t);
      const resolved = resolveTheme(t);
      setResolvedTheme(resolved);
      applyTheme(resolved);
      if (toolTheme) applyToolTheme(toolTheme);
      try {
        localStorage.setItem(STORAGE_KEY, t);
      } catch {}
    },
    [resolveTheme, toolTheme],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
        if (toolTheme) applyToolTheme(toolTheme);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, toolTheme]);

  useEffect(() => {
    if (toolTheme) applyToolTheme(toolTheme);
  }, [toolTheme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}