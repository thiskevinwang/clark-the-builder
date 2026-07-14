import { and, desc, eq } from "drizzle-orm";

import type { DB } from "@/lib/database/db";
import { ResourceRow, resources } from "@/lib/database/schema";

import type { CreateResourceInput, Resource, UpdateResourceInput } from "../models/resource";

const rowToModel = (row: ResourceRow): Resource => ({
  id: row.id,
  userId: row.userId,
  type: row.type,
  externalId: row.externalId,
  conversationId: row.conversationId,
  metadata: row.metadata,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const createResourceRepository = (db: DB) => ({
  async getById(userId: string, id: string) {
    const rows = await db
      .select()
      .from(resources)
      .where(and(eq(resources.userId, userId), eq(resources.id, id)));
    return rows[0] ? rowToModel(rows[0]) : null;
  },

  async getByExternalId(userId: string, externalId: string) {
    const rows = await db
      .select()
      .from(resources)
      .where(and(eq(resources.userId, userId), eq(resources.externalId, externalId)));
    return rows[0] ? rowToModel(rows[0]) : null;
  },

  async listByType(userId: string, type: string, limit = 50, offset = 0) {
    const rows = await db
      .select()
      .from(resources)
      .where(and(eq(resources.userId, userId), eq(resources.type, type)))
      .orderBy(desc(resources.createdAt))
      .limit(limit)
      .offset(offset);
    return rows.map(rowToModel);
  },

  async listByConversationId(userId: string, conversationId: string) {
    const rows = await db
      .select()
      .from(resources)
      .where(and(eq(resources.userId, userId), eq(resources.conversationId, conversationId)))
      .orderBy(desc(resources.createdAt));
    return rows.map(rowToModel);
  },

  async create(input: CreateResourceInput) {
    const rows = await db
      .insert(resources)
      .values({
        userId: input.userId,
        type: input.type,
        externalId: input.externalId,
        conversationId: input.conversationId ?? null,
        metadata: input.metadata ?? {},
      })
      .returning();
    return rowToModel(rows[0]);
  },

  async update(userId: string, id: string, input: UpdateResourceInput) {
    const rows = await db
      .update(resources)
      .set({
        ...(input.conversationId !== undefined && { conversationId: input.conversationId }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
      })
      .where(and(eq(resources.userId, userId), eq(resources.id, id)))
      .returning();
    return rows[0] ? rowToModel(rows[0]) : null;
  },

  async delete(userId: string, id: string) {
    const result = await db
      .delete(resources)
      .where(and(eq(resources.userId, userId), eq(resources.id, id)))
      .returning();
    return result.length > 0;
  },
});
