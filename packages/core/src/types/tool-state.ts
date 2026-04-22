export interface ToolState<T> {
  data: T;
  setData: (updater: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  lastSaved: Date | null;
  isDirty: boolean;
  saveNow: () => Promise<void>;
}