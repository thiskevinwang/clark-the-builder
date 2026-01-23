import { desc, eq } from "drizzle-orm";

import type { DB } from "@/lib/database/db";
import { ResourceRow, resources } from "@/lib/database/schema";

import type { Resource } from "../models/resource";
import type { ResourceRepository } from "./resource-repository";

const rowToModel = (row: ResourceRow): Resource => ({
  id: row.id,
  type: row.type,
  externalId: row.externalId,
  conversationId: row.conversationId,
  metadata: row.metadata,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const createResourceRepository = (db: DB): ResourceRepository => ({
  async getById(id) {
    const rows = await db.select().from(resources).where(eq(resources.id, id));
    return rows[0] ? rowToModel(rows[0]) : null;
  },

  async getByExternalId(externalId) {
    const rows = await db.select().from(resources).where(eq(resources.externalId, externalId));
    return rows[0] ? rowToModel(rows[0]) : null;
  },

  async listByType(type, limit = 50, offset = 0) {
    const rows = await db
      .select()
      .from(resources)
      .where(eq(resources.type, type))
      .orderBy(desc(resources.createdAt))
      .limit(limit)
      .offset(offset);
    return rows.map(rowToModel);
  },

  async listByConversationId(conversationId) {
    const rows = await db
      .select()
      .from(resources)
      .where(eq(resources.conversationId, conversationId))
      .orderBy(desc(resources.createdAt));
    return rows.map(rowToModel);
  },

  async create(input) {
    const rows = await db
      .insert(resources)
      .values({
        type: input.type,
        externalId: input.externalId,
        conversationId: input.conversationId ?? null,
        metadata: input.metadata ?? {},
      })
      .returning();
    return rowToModel(rows[0]);
  },

  async update(id, input) {
    const rows = await db
      .update(resources)
      .set({
        ...(input.conversationId !== undefined && { conversationId: input.conversationId }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
      })
      .where(eq(resources.id, id))
      .returning();
    return rows[0] ? rowToModel(rows[0]) : null;
  },

  async delete(id) {
    const result = await db.delete(resources).where(eq(resources.id, id)).returning();
    return result.length > 0;
  },
});
