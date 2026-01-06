/**
 * Storage interface abstraction.
 * This can be implemented with localStorage, remote storage, etc.
 */
export interface Storage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

/**
 * Clerk app data stored in storage
 */
export interface ClerkAppData {
  applicationId: string;
  name: string;
  createdAt: number;
  publishableKey?: string;
  /** Whether the app has been claimed (transferred to user's Clerk account) */
  claimed?: boolean;
  /** The transfer code used to claim the app */
  transferCode?: string;
}
