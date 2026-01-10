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
 * Ownership status of a Clerk application (derived from API, not stored)
 * - "owned": Application is owned by this app (returned in ListApplications)
 * - "transferred": Application was transferred to another account (has completed transfer in API)
 */
export type ClerkAppOwnership = "owned" | "transferred";

/**
 * Transfer status for applications with pending or completed transfers
 */
export type ClerkAppTransferStatus = "pending" | "completed";

/**
 * Transfer information (derived from API, not stored in localStorage)
 */
export interface ClerkAppTransfer {
  id: string;
  code: string;
  status: ClerkAppTransferStatus;
  expiresAt?: string;
  completedAt?: string;
}

/**
 * Clerk app data stored in localStorage (minimal - just what we need to remember)
 */
export interface ClerkAppStoredData {
  applicationId: string;
  name: string;
  createdAt: number;
}

/**
 * Full Clerk app data with API-derived fields (used in runtime state)
 */
export interface ClerkAppData extends ClerkAppStoredData {
  publishableKey?: string;
  secretKey?: string;
  /** Ownership status - derived from API response */
  ownership: ClerkAppOwnership;
  /** Transfer information - derived from API response */
  transfer?: ClerkAppTransfer;
}
