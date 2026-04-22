import type { ReactNode } from 'react';
import { useShell } from './tool-shell-context';

export function StatusBar({ children }: { children?: ReactNode }) {
  const { config } = useShell();
  if (!config.features.statusBar) return null;

  return (
    <footer className="tool-shell-statusbar" role="status" aria-label="Status">
      {children}
    </footer>
  );
}
