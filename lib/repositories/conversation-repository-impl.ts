import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import type { DB } from "@/lib/database/db";
import { ConversationRow, conversations, messages } from "@/lib/database/schema";

import type {
  Conversation,
  ConversationWithMessageCount,
  CreateConversationInput,
  UpdateConversationInput,
} from "../models/conversation";
import type { ConversationRepository } from "./conversation-repository";

const rowToModel = (row: ConversationRow): Conversation => ({
  id: row.id,
  userId: row.userId ?? null,
  title: row.title,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const rowToModelWithMessageCount = (row: {
  id: string;
  userId: string | null;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}): ConversationWithMessageCount => ({
  id: row.id,
  userId: row.userId ?? null,
  title: row.title,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  messageCount: row.messageCount,
});

export const createConversationRepository = (db: DB): ConversationRepository => ({
  async getById(id, userId) {
    const where = userId
      ? and(eq(conversations.id, id), eq(conversations.userId, userId))
      : eq(conversations.id, id);
    const rows = await db.select().from(conversations).where(where);
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async listRecent(limit, offset = 0, query, userId) {
    const q = query?.trim();
    const whereQuery = q
      ? or(ilike(conversations.title, `%${q}%`), ilike(conversations.id, `%${q}%`))
      : undefined;
    const whereUser = userId ? eq(conversations.userId, userId) : undefined;
    const where = whereQuery && whereUser ? and(whereQuery, whereUser) : (whereQuery ?? whereUser);

    const rows = await db
      .select()
      .from(conversations)
      .where(where)
      .orderBy(desc(conversations.updatedAt))
      .limit(limit)
      .offset(offset);
    return rows.map(rowToModel);
  },
  async listRecentWithMessageCount(limit, offset = 0, query, userId) {
    const q = query?.trim();
    const whereQuery = q
      ? or(ilike(conversations.title, `%${q}%`), ilike(conversations.id, `%${q}%`))
      : undefined;
    const whereUser = userId ? eq(conversations.userId, userId) : undefined;
    const where = whereQuery && whereUser ? and(whereQuery, whereUser) : (whereQuery ?? whereUser);

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
        userId: input.userId ?? null,
        title: input.title ?? null,
      })
      .returning();
    return rowToModel(rows[0]);
  },
  async update(id: string, input: UpdateConversationInput, userId) {
    // Only update fields explicitly provided.
    const set: Partial<ConversationRow> = {};
    if ("title" in input) {
      set.title = input.title ?? null;
    }

    // Nothing to update; return the existing row (or null).
    if (Object.keys(set).length === 0) {
      const where = userId
        ? and(eq(conversations.id, id), eq(conversations.userId, userId))
        : eq(conversations.id, id);
      const rows = await db.select().from(conversations).where(where);
      return rows[0] ? rowToModel(rows[0]) : null;
    }

    const rows = await db
      .update(conversations)
      .set(set)
      .where(
        userId
          ? and(eq(conversations.id, id), eq(conversations.userId, userId))
          : eq(conversations.id, id),
      )
      .returning();
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async delete(id: string, userId) {
    const rows = await db
      .delete(conversations)
      .where(
        userId
          ? and(eq(conversations.id, id), eq(conversations.userId, userId))
          : eq(conversations.id, id),
      )
      .returning({ id: conversations.id });
    return rows.length > 0;
  },
});
