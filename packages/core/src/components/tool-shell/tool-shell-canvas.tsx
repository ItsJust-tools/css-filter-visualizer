import type { ReactNode } from 'react';

export function Canvas({ children }: { children?: ReactNode }) {
  return (
    <main className="tool-shell-canvas" role="main" aria-label="Canvas">
      {children}
    </main>
  );
}
