export interface StorageData<T> {
  data: T;
  savedAt: string;
  version: string;
}

export interface AutoSaveOptions {
  enabled: boolean;
  debounceMs: number;
  key: string;
  maxHistoryEntries?: number;
}

export const defaultAutoSaveOptions: AutoSaveOptions = {
  enabled: true,
  debounceMs: 2000,
  key: 'itsjust-tool',
  maxHistoryEntries: 10,
};