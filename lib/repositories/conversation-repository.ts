import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import type { DB } from "@/lib/database/db";
import { ConversationRow, conversations, messages } from "@/lib/database/schema";

import type {
  Conversation,
  ConversationWithMessageCount,
  CreateConversationInput,
  UpdateConversationInput,
} from "../models/conversation";

const rowToModel = (row: ConversationRow): Conversation => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const rowToModelWithMessageCount = (row: {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}): ConversationWithMessageCount => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  messageCount: row.messageCount,
});

export const createConversationRepository = (db: DB) => ({
  async getById(userId: string, id: string) {
    const rows = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.userId, userId), eq(conversations.id, id)));
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async listRecent(userId: string, limit: number, offset = 0, query?: string) {
    const q = query?.trim();
    const searchWhere = q
      ? or(ilike(conversations.title, `%${q}%`), ilike(conversations.id, `%${q}%`))
      : undefined;
    const where = and(eq(conversations.userId, userId), searchWhere);

    const rows = await db
      .select()
      .from(conversations)
      .where(where)
      .orderBy(desc(conversations.updatedAt))
      .limit(limit)
      .offset(offset);
    return rows.map(rowToModel);
  },
  async listRecentWithMessageCount(userId: string, limit: number, offset = 0, query?: string) {
    const q = query?.trim();
    const searchWhere = q
      ? or(ilike(conversations.title, `%${q}%`), ilike(conversations.id, `%${q}%`))
      : undefined;
    const where = and(eq(conversations.userId, userId), searchWhere);

    const messageCount = sql<number>`count(${messages.id})`.mapWith(Number);

    const rows = await db
      .select({
        id: conversations.id,
        userId: conversations.userId,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        messageCount,
      })
      .from(conversations)
      .leftJoin(messages, eq(messages.conversationId, conversations.id))
      .where(where)
      .groupBy(conversations.id)
      .orderBy(desc(conversations.updatedAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) =>
      rowToModelWithMessageCount({
        ...row,
        messageCount: row.messageCount ?? 0,
      }),
    );
  },
  async create(input: CreateConversationInput) {
    const rows = await db
      .insert(conversations)
      .values({
        userId: input.userId,
        title: input.title ?? null,
      })
      .returning();
    return rowToModel(rows[0]);
  },
  async update(userId: string, id: string, input: UpdateConversationInput) {
    // Only update fields explicitly provided.
    const set: Partial<ConversationRow> = {};
    if ("title" in input) {
      set.title = input.title ?? null;
    }

    // Nothing to update; return the existing row (or null).
    if (Object.keys(set).length === 0) {
      const rows = await db
        .select()
        .from(conversations)
        .where(and(eq(conversations.userId, userId), eq(conversations.id, id)));
      return rows[0] ? rowToModel(rows[0]) : null;
    }

    const rows = await db
      .update(conversations)
      .set(set)
      .where(and(eq(conversations.userId, userId), eq(conversations.id, id)))
      .returning();
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async delete(userId: string, id: string) {
    const rows = await db
      .delete(conversations)
      .where(and(eq(conversations.userId, userId), eq(conversations.id, id)))
      .returning({ id: conversations.id });
    return rows.length > 0;
  },
  async deleteMany(userId: string, ids: string[]) {
    if (ids.length === 0) return [];

    const rows = await db
      .delete(conversations)
      .where(and(eq(conversations.userId, userId), inArray(conversations.id, ids)))
      .returning({ id: conversations.id });

    return rows.map((row) => row.id);
  },
});
