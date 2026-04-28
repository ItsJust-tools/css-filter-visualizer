'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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

function applyToolTheme(toolTheme: ToolTheme, prev?: ToolTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (toolTheme.accent && toolTheme.accent !== prev?.accent) root.style.setProperty('--accent', toolTheme.accent);
  if (toolTheme.accentHover && toolTheme.accentHover !== prev?.accentHover) root.style.setProperty('--accent-hover', toolTheme.accentHover);
  if (toolTheme.accentSubtle && toolTheme.accentSubtle !== prev?.accentSubtle) root.style.setProperty('--accent-subtle', toolTheme.accentSubtle);
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch (error) {
    console.warn('[ThemeProvider] Failed to read theme from localStorage:', error);
  }
  return 'system';
}

export function ThemeProvider({ children, toolTheme }: { children: React.ReactNode; toolTheme?: ToolTheme }) {
  const lastToolThemeRef = useRef<ToolTheme | undefined>(undefined);
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());
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
      try {
        localStorage.setItem(STORAGE_KEY, t);
      } catch (error) {
        console.warn('[ThemeProvider] Failed to save theme to localStorage:', error);
      }
    },
    [resolveTheme],
  );

  // Apply theme on mount and when toolTheme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
    if (toolTheme) {
      applyToolTheme(toolTheme, lastToolThemeRef.current);
      lastToolThemeRef.current = toolTheme;
    }
  }, [toolTheme, resolvedTheme]);

  // Listen for system color-scheme changes (only when theme is 'system')
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

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
ThemeProvider.displayName = 'ThemeProvider';