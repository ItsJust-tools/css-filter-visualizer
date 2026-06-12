/**
 * Shared utility functions for the CSS Filter Visualizer.
 */

/**
 * Generate a unique identifier for newly created filter steps.
 * Uses {@link crypto.randomUUID} when available (all modern browsers), falling
 * back to a timestamp + random hex suffix for environments without it.
 * Prefix is "f-" to make IDs visually differentiable from other ID namespaces.
 *
 * @returns A unique identifier string
 */
export function generateId(): string {
  try {
    return `f-${crypto.randomUUID()}`;
  } catch {
    return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
