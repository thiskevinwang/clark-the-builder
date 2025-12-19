"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { storage } from "./local-storage";
import type { ClerkAppData } from "./types";

const CLERK_APPS_KEY = "clerk-apps";

interface ApiApplication {
  applicationId: string;
  publishableKey?: string;
}

interface ClerkAppsStore {
  apps: ClerkAppData[];
  isLoaded: boolean;
  isSyncing: boolean;
  loadApps: () => Promise<void>;
  syncWithApi: () => Promise<void>;
  addApp: (app: ClerkAppData) => Promise<void>;
  removeApp: (applicationId: string) => Promise<void>;
}

export const useClerkAppsStore = create<ClerkAppsStore>()((set, get) => ({
  apps: [],
  isLoaded: false,
  isSyncing: false,

  loadApps: async () => {
    const apps = await storage.get<ClerkAppData[]>(CLERK_APPS_KEY);
    set({ apps: apps ?? [], isLoaded: true });
  },

  syncWithApi: async () => {
    const { isSyncing } = get();
    if (isSyncing) return;

    set({ isSyncing: true });

    try {
      const response = await fetch("/api/applications");
      if (!response.ok) {
        console.error("Failed to fetch applications from API");
        return;
      }

      const data = await response.json();
      const apiApps: ApiApplication[] = data.applications ?? [];

      const currentApps = get().apps;
      const currentAppIds = new Set(currentApps.map((a) => a.applicationId));

      // Find apps from API that aren't in local storage
      const newApps: ClerkAppData[] = apiApps
        .filter((apiApp) => !currentAppIds.has(apiApp.applicationId))
        .map((apiApp) => ({
          applicationId: apiApp.applicationId,
          name: `App ${apiApp.applicationId.slice(-8)}`, // Use last 8 chars of ID as fallback name
          createdAt: Date.now(),
          publishableKey: apiApp.publishableKey,
        }));

      // Also remove local apps that no longer exist in API
      const apiAppIds = new Set(apiApps.map((a) => a.applicationId));
      const validApps = currentApps.filter((app) =>
        apiAppIds.has(app.applicationId)
      );

      if (newApps.length > 0 || validApps.length !== currentApps.length) {
        const updatedApps = [...newApps, ...validApps];
        await storage.set(CLERK_APPS_KEY, updatedApps);
        set({ apps: updatedApps });
      }
    } catch (error) {
      console.error("Error syncing with API:", error);
    } finally {
      set({ isSyncing: false });
    }
  },

  addApp: async (app: ClerkAppData) => {
    const currentApps = get().apps;
    // Don't add duplicates
    if (currentApps.some((a) => a.applicationId === app.applicationId)) {
      return;
    }
    const updatedApps = [app, ...currentApps];
    await storage.set(CLERK_APPS_KEY, updatedApps);
    set({ apps: updatedApps });
  },

  removeApp: async (applicationId: string) => {
    const currentApps = get().apps;
    const updatedApps = currentApps.filter(
      (app) => app.applicationId !== applicationId
    );
    await storage.set(CLERK_APPS_KEY, updatedApps);
    set({ apps: updatedApps });
  },
}));

/**
 * Hook to initialize the clerk apps store
 */
export function useClerkAppsInit() {
  const { loadApps, syncWithApi, isLoaded } = useClerkAppsStore();

  useEffect(() => {
    if (!isLoaded) {
      loadApps().then(() => {
        // After loading local apps, sync with API
        syncWithApi();
      });
    }
  }, [loadApps, syncWithApi, isLoaded]);
}
