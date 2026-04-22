import { useEffect } from 'react';
import type { ToolbarActions } from './tool-shell-context';
import type { ShortcutGroup, ToolConfig } from '../../types';

export function useKeyboardShortcuts(actions: ToolbarActions, onShowShortcuts: () => void) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              actions.onRedo?.();
            } else {
              e.preventDefault();
              actions.onUndo?.();
            }
            break;
          case 'y':
            e.preventDefault();
            actions.onRedo?.();
            break;
          case 's':
            e.preventDefault();
            break;
          case 'b':
            e.preventDefault();
            actions.onToggleSidebar?.();
            break;
        }
        return;
      }

      if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        onShowShortcuts();
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we destructure actions callbacks explicitly; the whole object reference changes every render
  }, [actions.onUndo, actions.onRedo, actions.onToggleSidebar, onShowShortcuts]);
}

export function buildDefaultShortcutGroups(config: ToolConfig): ShortcutGroup[] {
  const groups: ShortcutGroup[] = [];

  const general: typeof groups[0]['shortcuts'] = [];
  if (config.features.undoRedo) {
    general.push({ keys: 'Ctrl+Z', label: 'Undo' });
    general.push({ keys: 'Ctrl+Y', label: 'Redo' });
  }
  general.push({ keys: 'Ctrl+S', label: 'Save', description: 'auto-saves anyway' });
  if (general.length) groups.push({ title: 'General', shortcuts: general });

  const actions: typeof groups[0]['shortcuts'] = [];
  if (config.features.export) actions.push({ keys: 'Ctrl+E', label: 'Export' });
  if (actions.length) groups.push({ title: 'Actions', shortcuts: actions });

  const view: typeof groups[0]['shortcuts'] = [];
  if (config.features.sidebar) view.push({ keys: 'Ctrl+B', label: 'Toggle sidebar' });
  if (config.features.darkMode) view.push({ keys: 'Ctrl+D', label: 'Toggle dark mode' });
  if (view.length) groups.push({ title: 'View', shortcuts: view });

  groups.push({
    title: 'Help',
    shortcuts: [{ keys: '?', label: 'Show keyboard shortcuts' }],
  });

  return groups;
}
