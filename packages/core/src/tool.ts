import type { ToolConfig } from './types';

/**
 * Contract that every itsjust tool must implement.
 * Provides the framework with everything it needs for
 * state persistence, export, import, and sharing.
 */
export interface Tool<TState = unknown> {
  /** Unique identifier — used for storage keys and share files */
  id: string;
  /** Human-readable name */
  name: string;
  /** Schema version — bumped when share format changes */
  version: string;
  /** Full tool configuration */
  config: ToolConfig;
  /** State shown when the tool loads for the first time */
  initialState: TState;
  /** Convert state to a string for export / share */
  serialize(state: TState): string;
  /** Recover state from an imported / shared payload */
  deserialize(data: unknown): TState;
}
