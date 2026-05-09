import { auth } from "@clerk/nextjs/server";

import type { User } from "@/lib/models/user";

import { db } from "./database/db";
import { createUserRepository } from "./repositories/user-repository-impl";

export async function getCurrentLocalUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const userRepository = createUserRepository(db);
  const existingUser = await userRepository.getByExternalUserId(userId);
  if (existingUser) {
    return existingUser;
  }

  return userRepository.upsert({
    externalUserId: userId,
  });
}
