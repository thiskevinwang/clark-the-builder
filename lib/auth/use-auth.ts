"use client";

import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";

import type { AuthState, AuthUser } from "./types";

const toAuthUser = (user: ReturnType<typeof useUser>["user"]): AuthUser | null => {
  if (!user) return null;
  return {
    externalId: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    name: user.fullName ?? user.username ?? null,
    imageUrl: user.imageUrl ?? null,
  };
};

export function useAuth(): AuthState {
  const { isLoaded, isSignedIn, user } = useUser();
  const { userId, getToken, signOut } = useClerkAuth();

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    userId: userId ?? null,
    user: toAuthUser(user),
    getToken: async (options?: { template?: string }) => {
      try {
        return (await getToken(options)) ?? null;
      } catch {
        return null;
      }
    },
    signOut: async () => {
      await signOut();
    },
  };
}
