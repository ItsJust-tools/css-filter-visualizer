'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import type { AutoSaveOptions, ToolState } from '../types';
import { defaultAutoSaveOptions } from '../types';
import { storageManager as storage } from '../engines/storage-manager';

const MAX_HISTORY = 50;
const HISTORY_DEBOUNCE_MS = 400;

function isUpdaterFunction<T>(value: T | ((prev: T) => T)): value is (prev: T) => T {
  return typeof value === 'function';
}

export function useToolState<T>(
  initial: T,
  options: Partial<AutoSaveOptions> = {},
): ToolState<T> {
  const opts = { ...defaultAutoSaveOptions, ...options };
  const [data, setDataInternal] = useState<T>(initial);
  const dataRef = useRef<T>(initial);

  const historyRef = useRef<T[]>([initial]);
  const futureRef = useRef<T[]>([]);
  const lastSavedRef = useRef<T>(initial);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStateRef = useRef<T | null>(null);

  // Keep dataRef in sync with data
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Debounced history push: runs when data changes
  useEffect(() => {
    if (pendingStateRef.current === null) return;

    historyTimerRef.current = setTimeout(() => {
      if (pendingStateRef.current !== null) {
        historyRef.current.push(pendingStateRef.current);
        if (historyRef.current.length > MAX_HISTORY) {
          historyRef.current.shift();
        }
        pendingStateRef.current = null;
        setCanUndo(historyRef.current.length > 1);
      }
    }, HISTORY_DEBOUNCE_MS);

    return () => {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
        historyTimerRef.current = null;
      }
    };
  }, [data]);

  // Debounced auto-save: runs when data changes
  useEffect(() => {
    if (!opts.enabled) return;

    autoSaveTimerRef.current = setTimeout(() => {
      storage.saveLocal(opts.key, dataRef.current);
      lastSavedRef.current = dataRef.current;
      setIsDirty(false);
      setLastSaved(new Date());
    }, opts.debounceMs);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [data, opts.enabled, opts.debounceMs, opts.key]);

  const setData = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setDataInternal((prev) => {
        const next = isUpdaterFunction(updater) ? updater(prev) : updater;
        pendingStateRef.current = next;
        futureRef.current = [];
        setCanRedo(false);
        setIsDirty(next !== lastSavedRef.current);
        return next;
      });
    },
    [],
  );

  const undo = useCallback(() => {
    // Flush any pending history entry first
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
    if (pendingStateRef.current !== null) {
      historyRef.current.push(pendingStateRef.current);
      if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
      pendingStateRef.current = null;
    }

    if (historyRef.current.length <= 1) return;
    const current = historyRef.current.pop()!;
    futureRef.current.push(current);
    const prev = historyRef.current[historyRef.current.length - 1];
    dataRef.current = prev;
    setDataInternal(prev);
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    historyRef.current.push(next);
    dataRef.current = next;
    setDataInternal(next);
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const clearHistory = useCallback(() => {
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
    pendingStateRef.current = null;
    historyRef.current = [dataRef.current];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const saveNow = useCallback(async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    storage.saveLocal(opts.key, dataRef.current);
    lastSavedRef.current = dataRef.current;
    setIsDirty(false);
    setLastSaved(new Date());
  }, [opts.key]);

  return {
    data,
    setData,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    lastSaved,
    isDirty,
    saveNow,
  };
}
