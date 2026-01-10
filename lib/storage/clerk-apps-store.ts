"use client";

import { useEffect } from "react";
import { create } from "zustand";

import type { ApplicationWithTransfers } from "@/app/api/applications/route";

import { storage } from "./local-storage";
import type { ClerkAppData, ClerkAppStoredData, ClerkAppTransferStatus } from "./types";

const CLERK_APPS_KEY = "clerk-apps";

interface ClerkAppsStore {
  apps: ClerkAppData[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadApps: () => Promise<void>;
  addApp: (app: ClerkAppStoredData) => Promise<void>;
  removeApp: (applicationId: string) => Promise<void>;
}

/**
 * Merge API applications with localStorage data.
 * - Apps from API are "owned" (or "transferred" if they have a completed transfer)
 * - Apps in localStorage but not in API are "transferred" (they were transferred and completed)
 */
function mergeApplications(
  apiApps: ApplicationWithTransfers[],
  storedApps: ClerkAppStoredData[],
): ClerkAppData[] {
  const apiAppIds = new Set(apiApps.map((app) => app.application_id));
  const mergedApps: ClerkAppData[] = [];

  // Process API apps
  for (const apiApp of apiApps) {
    const storedApp = storedApps.find((app) => app.applicationId === apiApp.application_id);
    const devInstance = apiApp.instances.find((i) => i.environment_type === "development");

    // Find pending or completed transfer for this app
    const pendingTransfer = apiApp.transfers?.find((t) => t.status === "pending");
    const completedTransfer = apiApp.transfers?.find((t) => t.status === "completed");

    // If there's a completed transfer, the app is "transferred"
    // Otherwise it's "owned"
    const ownership = completedTransfer ? "transferred" : "owned";
    const transfer = pendingTransfer ?? completedTransfer;

    mergedApps.push({
      applicationId: apiApp.application_id,
      name: storedApp?.name ?? `App ${apiApp.application_id.slice(0, 8)}`,
      createdAt: storedApp?.createdAt ?? Date.now(),
      publishableKey: devInstance?.publishable_key,
      secretKey: devInstance?.secret_key,
      ownership,
      transfer: transfer
        ? {
            id: transfer.id,
            code: transfer.code,
            status: transfer.status as ClerkAppTransferStatus,
            expiresAt: transfer.expires_at,
            completedAt: transfer.completed_at ?? undefined,
          }
        : undefined,
    });
  }

  // Process stored apps not in API - these are "transferred" (completed and no longer owned)
  for (const storedApp of storedApps) {
    if (!apiAppIds.has(storedApp.applicationId)) {
      mergedApps.push({
        ...storedApp,
        ownership: "transferred",
      });
    }
  }

  // Sort by createdAt descending (newest first)
  return mergedApps.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Extract only the data we want to persist to localStorage
 */
function toStoredData(apps: ClerkAppData[]): ClerkAppStoredData[] {
  return apps.map(({ applicationId, name, createdAt }) => ({
    applicationId,
    name,
    createdAt,
  }));
}

export const useClerkAppsStore = create<ClerkAppsStore>()((set, get) => ({
  apps: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  loadApps: async () => {
    set({ isLoading: true, error: null });

    try {
      // Load localStorage apps first (minimal stored data)
      const storedApps = (await storage.get<ClerkAppStoredData[]>(CLERK_APPS_KEY)) ?? [];

      // Try to fetch from API
      try {
        const response = await fetch("/api/applications");

        if (response.ok) {
          const data = (await response.json()) as { applications: ApplicationWithTransfers[] };
          const mergedApps = mergeApplications(data.applications, storedApps);

          // Save only minimal data back to localStorage
          await storage.set(CLERK_APPS_KEY, toStoredData(mergedApps));

          set({ apps: mergedApps, isLoaded: true, isLoading: false });
          return;
        }

        console.warn("Failed to fetch applications from API, using localStorage only");
      } catch (fetchError) {
        // Network error - use localStorage data
        console.warn("Network error fetching applications:", fetchError);
      }

      // Fallback: use localStorage data as-is (without API-derived fields)
      const fallbackApps: ClerkAppData[] = storedApps.map((app) => ({
        ...app,
        ownership: "owned", // Assume owned if we can't reach API
      }));
      set({ apps: fallbackApps, isLoaded: true, isLoading: false });
    } catch (error) {
      console.error("Error loading apps:", error);
      set({
        apps: [],
        isLoaded: true,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load apps",
      });
    }
  },

  addApp: async (app: ClerkAppStoredData) => {
    const currentApps = get().apps;
    // Don't add duplicates
    if (currentApps.some((a) => a.applicationId === app.applicationId)) {
      return;
    }
    const newApp: ClerkAppData = {
      ...app,
      ownership: "owned",
    };
    const updatedApps = [newApp, ...currentApps];
    await storage.set(CLERK_APPS_KEY, toStoredData(updatedApps));
    set({ apps: updatedApps });
  },

  removeApp: async (applicationId: string) => {
    const currentApps = get().apps;
    const appToRemove = currentApps.find((app) => app.applicationId === applicationId);

    // Only call the API to delete if the app is owned (exists in Clerk)
    if (appToRemove?.ownership === "owned") {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete application");
      }
    }

    // Remove from local storage regardless of ownership
    const updatedApps = currentApps.filter((app) => app.applicationId !== applicationId);
    await storage.set(CLERK_APPS_KEY, toStoredData(updatedApps));
    set({ apps: updatedApps });
  },
}));

/**
 * Hook to initialize the clerk apps store
 */
export function useClerkAppsInit() {
  const { loadApps, isLoaded, isLoading } = useClerkAppsStore();

  useEffect(() => {
    if (!isLoaded && !isLoading) {
      loadApps();
    }
  }, [loadApps, isLoaded, isLoading]);
}
