import type { Storage } from "./types";

/**
 * LocalStorage implementation of the Storage interface.
 * This can be swapped out for remote storage later.
 */
export class LocalStorage implements Storage {
  private prefix: string;

  constructor(prefix = "clark:") {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (typeof window === "undefined") return null;

    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.getKey(key), JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.getKey(key));
  }

  async keys(): Promise<string[]> {
    if (typeof window === "undefined") return [];

    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        allKeys.push(key.slice(this.prefix.length));
      }
    }
    return allKeys;
  }
}

// Default storage instance
export const storage = new LocalStorage();
