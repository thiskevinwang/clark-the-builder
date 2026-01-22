import { auth, currentUser } from "@clerk/nextjs/server";

import type { AuthUser } from "./types";

export interface ServerAuthState {
  userId: string | null;
  user: AuthUser | null;
  getToken: (options?: { template?: string }) => Promise<string | null>;
}

export async function getServerAuth(): Promise<ServerAuthState> {
  const { userId, getToken } = await auth();
  const user = userId ? await currentUser() : null;

  return {
    userId: userId ?? null,
    user: user
      ? {
          externalId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? null,
          name: user.fullName ?? user.username ?? null,
          imageUrl: user.imageUrl ?? null,
        }
      : null,
    getToken: async (options?: { template?: string }) => {
      try {
        return (await getToken(options)) ?? null;
      } catch {
        return null;
      }
    },
  };
}
