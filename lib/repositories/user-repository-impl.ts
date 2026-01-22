import { eq } from "drizzle-orm";

import type { DB } from "@/lib/database/db";
import { users } from "@/lib/database/schema";
import type { UpsertUserInput, User } from "@/lib/models/user";

const rowToModel = (row: typeof users.$inferSelect): User => ({
  id: row.id,
  externalId: row.externalId,
  email: row.email ?? null,
  name: row.name ?? null,
  imageUrl: row.imageUrl ?? null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const createUserRepository = (db: DB) => ({
  async getByExternalId(externalId: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.externalId, externalId)).limit(1);
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async upsertFromExternal(input: UpsertUserInput): Promise<User> {
    const rows = await db
      .insert(users)
      .values({
        externalId: input.externalId,
        email: input.email ?? null,
        name: input.name ?? null,
        imageUrl: input.imageUrl ?? null,
      })
      .onConflictDoUpdate({
        target: users.externalId,
        set: {
          email: input.email ?? null,
          name: input.name ?? null,
          imageUrl: input.imageUrl ?? null,
        },
      })
      .returning();

    return rowToModel(rows[0]);
  },
  async ensureByExternalId(externalId: string): Promise<User> {
    const existingRows = await db
      .select()
      .from(users)
      .where(eq(users.externalId, externalId))
      .limit(1);
    if (existingRows[0]) return rowToModel(existingRows[0]);

    const rows = await db
      .insert(users)
      .values({
        externalId,
      })
      .returning();

    return rowToModel(rows[0]);
  },
});
