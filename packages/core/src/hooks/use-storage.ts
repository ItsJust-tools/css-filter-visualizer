'use client';

import { useCallback, useMemo } from 'react';
import { StorageManager } from '../engines/storage-manager';

export function useStorage(prefix = 'itsjust') {
  const manager = useMemo(() => new StorageManager(prefix), [prefix]);

  const save = useCallback(
    <T,>(key: string, data: T) => manager.saveLocal(key, data),
    [manager],
  );

  const load = useCallback(
    <T,>(key: string) => manager.loadLocal<T>(key),
    [manager],
  );

  const clear = useCallback((key: string) => manager.clearLocal(key), [manager]);

  return { save, load, clear };
}