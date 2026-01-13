import { desc, eq, ilike, or } from "drizzle-orm";

import type { DB } from "@/lib/database/db";
import { ConversationRow, conversations } from "@/lib/database/schema";

import type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
} from "../models/conversation";
import type { ConversationRepository } from "./conversation-repository";

const rowToModel = (row: ConversationRow): Conversation => ({
  id: row.id,
  title: row.title,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const createConversationRepository = (db: DB): ConversationRepository => ({
  async getById(id) {
    const rows = await db.select().from(conversations).where(eq(conversations.id, id));
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async listRecent(limit, offset = 0, query) {
    const q = query?.trim();
    const where = q
      ? or(ilike(conversations.title, `%${q}%`), ilike(conversations.id, `%${q}%`))
      : undefined;

    const rows = await db
      .select()
      .from(conversations)
      .where(where)
      .orderBy(desc(conversations.updatedAt))
      .limit(limit)
      .offset(offset);
    return rows.map(rowToModel);
  },
  async create(input: CreateConversationInput) {
    const rows = await db
      .insert(conversations)
      .values({
        title: input.title ?? null,
      })
      .returning();
    return rowToModel(rows[0]);
  },
  async update(id: string, input: UpdateConversationInput) {
    // Only update fields explicitly provided.
    const set: Partial<ConversationRow> = {};
    if ("title" in input) {
      set.title = input.title ?? null;
    }

    // Nothing to update; return the existing row (or null).
    if (Object.keys(set).length === 0) {
      const rows = await db.select().from(conversations).where(eq(conversations.id, id));
      return rows[0] ? rowToModel(rows[0]) : null;
    }

    const rows = await db
      .update(conversations)
      .set(set)
      .where(eq(conversations.id, id))
      .returning();
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async delete(id: string) {
    const rows = await db
      .delete(conversations)
      .where(eq(conversations.id, id))
      .returning({ id: conversations.id });
    return rows.length > 0;
  },
});
