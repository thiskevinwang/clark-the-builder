import { eq } from "drizzle-orm";

import type { DB } from "@/lib/database/db";
import { users, type UserRow } from "@/lib/database/schema";

import type { CreateUserInput, UpsertUserInput, User } from "../models/user";

const rowToModel = (row: UserRow): User => ({
  id: row.id,
  externalUserId: row.externalUserId,
  emailAddress: row.emailAddress,
  firstName: row.firstName,
  lastName: row.lastName,
  imageUrl: row.imageUrl,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const buildValues = (input: CreateUserInput): typeof users.$inferInsert => ({
  ...(input.id ? { id: input.id } : {}),
  externalUserId: input.externalUserId,
  ...(input.emailAddress !== undefined ? { emailAddress: input.emailAddress } : {}),
  ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
  ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
  ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
});

export const createUserRepository = (db: DB) => ({
  async getById(id: string) {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async getByExternalUserId(externalUserId: string) {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.externalUserId, externalUserId))
      .limit(1);
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async create(input: CreateUserInput) {
    const rows = await db.insert(users).values(buildValues(input)).returning();
    return rowToModel(rows[0]);
  },
  async upsert(input: UpsertUserInput) {
    const insertValues = buildValues(input);
    const updateValues: Partial<typeof users.$inferInsert> = { ...insertValues };
    delete updateValues.id;

    const row = await db
      .insert(users)
      .values(insertValues)
      .onConflictDoUpdate({
        target: users.externalUserId,
        set: updateValues,
      })
      .returning()
      .then((rows) => rows[0]);

    return rowToModel(row);
  },
  async deleteByExternalUserId(externalUserId: string) {
    const rows = await db
      .delete(users)
      .where(eq(users.externalUserId, externalUserId))
      .returning({ id: users.id });
    return rows.length > 0;
  },
});
