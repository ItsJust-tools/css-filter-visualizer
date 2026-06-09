/**
 * Shared utility functions for the CSS Filter Visualizer.
 */

/**
 * Generate a unique (time + random) identifier for newly created filter steps.
 * Format: "f-" + timestamp + random suffix.
 *
 * @returns A unique identifier string
 */
export function generateId(): string {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
