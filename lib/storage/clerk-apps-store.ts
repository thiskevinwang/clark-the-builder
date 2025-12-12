"use client";

import type { ClerkAppData } from "./types";
import { storage } from "./local-storage";
import { create } from "zustand";
import { useEffect } from "react";

const CLERK_APPS_KEY = "clerk-apps";

interface ClerkAppsStore {
  apps: ClerkAppData[];
  isLoaded: boolean;
  loadApps: () => Promise<void>;
  addApp: (app: ClerkAppData) => Promise<void>;
  removeApp: (applicationId: string) => Promise<void>;
}

export const useClerkAppsStore = create<ClerkAppsStore>()((set, get) => ({
  apps: [],
  isLoaded: false,

  loadApps: async () => {
    const apps = await storage.get<ClerkAppData[]>(CLERK_APPS_KEY);
    set({ apps: apps ?? [], isLoaded: true });
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
  const { loadApps, isLoaded } = useClerkAppsStore();

  useEffect(() => {
    if (!isLoaded) {
      loadApps();
    }
  }, [loadApps, isLoaded]);
}
