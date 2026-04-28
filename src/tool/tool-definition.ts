import type { Tool } from '@itsjust/core';
import toolConfig from './tool.config';
import type { ToolState } from './types';

function isToolState(value: unknown): value is ToolState {
  if (typeof value !== 'object' || value === null) return false;
  return typeof (value as { title?: unknown }).title === 'string';
}

export const myTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: {
    title: toolConfig.name,
  },
  // Derive id/name/version from config to avoid drift
  serialize: (state) => JSON.stringify(state, null, 2),
  deserialize: (data) => {
    if (isToolState(data)) {
      return { success: true, data: { title: data.title } };
    }
    return { success: false, error: 'Invalid data format: missing title' };
  },
  exporters: [
    { format: 'png', loader: () => import('./exporters/png') },
    { format: 'jpeg', loader: () => import('./exporters/jpeg') },
    { format: 'webp', loader: () => import('./exporters/webp') },
    { format: 'pdf', loader: () => import('./exporters/pdf') },
  ],
};
