import type { Tool } from '@itsjust/core';
import toolConfig from './tool.config';
import type { ToolState } from './types';

export const myTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: {
    title: toolConfig.name,
  },
  serialize: (state) => JSON.stringify(state, null, 2),
  deserialize: (data) => {
    if (typeof data === 'object' && data !== null && 'title' in data) {
      const record = data as Record<string, unknown>;
      return { title: String(record.title) };
    }
    return { title: toolConfig.name };
  },
};
