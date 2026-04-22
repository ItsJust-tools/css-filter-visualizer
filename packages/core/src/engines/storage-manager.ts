import type { StorageData } from '../types';

const DB_NAME = 'itsjust-storage';
const DB_VERSION = 1;
const STORE_NAME = 'history';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class StorageManager {
  private prefix: string;

  constructor(prefix = 'itsjust') {
    this.prefix = prefix;
  }

  private key(k: string): string {
    return `${this.prefix}:${k}`;
  }

  // --- localStorage ---

  saveLocal<T>(key: string, data: T): void {
    const entry: StorageData<T> = {
      data,
      savedAt: new Date().toISOString(),
      version: '0.1.0',
    };
    localStorage.setItem(this.key(key), JSON.stringify(entry));
  }

  loadLocal<T>(key: string): T | null {
    const raw = localStorage.getItem(this.key(key));
    if (!raw) return null;
    try {
      const entry: StorageData<T> = JSON.parse(raw);
      return entry.data;
    } catch {
      return null;
    }
  }

  clearLocal(key: string): void {
    localStorage.removeItem(this.key(key));
  }

  // --- IndexedDB (history) ---

  async saveHistory<T>(key: string, data: T): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const entry: StorageData<T> & { key: string } = {
      key: this.key(key),
      data,
      savedAt: new Date().toISOString(),
      version: '0.1.0',
    };
    store.put(entry);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async listHistory<T>(key: string, maxEntries = 10): Promise<StorageData<T>[]> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const prefix = this.key(key);
    const results: StorageData<T>[] = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor(IDBKeyRange.lowerBound(prefix));
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < maxEntries) {
          const value = cursor.value;
          if (
            value !== null &&
            typeof value === 'object' &&
            'key' in value &&
            typeof value.key === 'string' &&
            value.key.startsWith(prefix)
          ) {
            results.push(value as StorageData<T> & { key: string });
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearHistory(key: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(IDBKeyRange.lowerBound(this.key(key)));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const storageManager = new StorageManager();