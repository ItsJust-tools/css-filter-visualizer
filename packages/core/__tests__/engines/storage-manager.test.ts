import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '../../src/engines/storage-manager';

describe('StorageManager', () => {
  let manager: StorageManager;

  beforeEach(() => {
    manager = new StorageManager('test');
    localStorage.clear();
  });

  it('saves and loads data from localStorage', () => {
    manager.saveLocal('key1', { name: 'test' });
    const result = manager.loadLocal<{ name: string }>('key1');
    expect(result).toEqual({ name: 'test' });
  });

  it('returns null for missing keys', () => {
    const result = manager.loadLocal('nonexistent');
    expect(result).toBeNull();
  });

  it('clears data from localStorage', () => {
    manager.saveLocal('key2', 'value');
    manager.clearLocal('key2');
    expect(manager.loadLocal('key2')).toBeNull();
  });

  it('handles different data types', () => {
    manager.saveLocal('string', 'hello');
    manager.saveLocal('number', 42);
    manager.saveLocal('array', [1, 2, 3]);

    expect(manager.loadLocal<string>('string')).toBe('hello');
    expect(manager.loadLocal<number>('number')).toBe(42);
    expect(manager.loadLocal<number[]>('array')).toEqual([1, 2, 3]);
  });
});