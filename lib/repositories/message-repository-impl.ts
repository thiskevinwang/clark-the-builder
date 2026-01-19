import { asc, eq } from "drizzle-orm";

import type { DB } from "@/lib/database/db";
import { conversations, MessageRow, messages } from "@/lib/database/schema";

import type { CreateMessageInput, Message, UpdateMessageInput } from "../models/message";
import type { MessageRepository } from "./message-repository";

const rowToModel = (row: MessageRow): Message => ({
  id: row.id,
  conversationId: row.conversationId,
  role: row.role,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  parts: row.parts,
  metadata: row.metadata,
  parentId: row.parentId,
});

const buildInsertValues = (input: CreateMessageInput): typeof messages.$inferInsert => ({
  ...(input.id ? { id: input.id } : {}),
  conversationId: input.conversationId,
  ...(input.role !== undefined ? { role: input.role } : {}),
  ...(input.metadata !== undefined ? { metadata: input.metadata as MessageRow["metadata"] } : {}),
  ...(input.parts !== undefined ? { parts: input.parts as unknown as MessageRow["parts"] } : {}),
  ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
  ...(input.externalId !== undefined ? { externalId: input.externalId } : {}),
});

const buildUpdateValues = (input: UpdateMessageInput): Partial<typeof messages.$inferInsert> => ({
  ...(input.role !== undefined ? { role: input.role } : {}),
  ...(input.metadata !== undefined ? { metadata: input.metadata as MessageRow["metadata"] } : {}),
  ...(input.parts !== undefined ? { parts: input.parts as unknown as MessageRow["parts"] } : {}),
  ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
  ...(input.externalId !== undefined ? { externalId: input.externalId } : {}),
});

export const createMessageRepository = (db: DB): MessageRepository => ({
  async getById(id) {
    const rows = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return rows[0] ? rowToModel(rows[0]) : null;
  },
  async listByConversationId(conversationId) {
    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
    return rows.map(rowToModel);
  },
  async create(input: CreateMessageInput) {
    // Idempotent insert: message ids can be retried by the client.
    const rows = await db.insert(messages).values(buildInsertValues(input)).returning();

    // Touch conversation for "recent chats" ordering.
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, input.conversationId));

    return rowToModel(rows[0]);
  },
  async update(id: string, input: UpdateMessageInput) {
    const updates = buildUpdateValues(input);
    if (Object.keys(updates).length === 0) {
      const rows = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
      return rows[0] ? rowToModel(rows[0]) : null;
    }

    const rows = await db.update(messages).set(updates).where(eq(messages.id, id)).returning();
    if (!rows[0]) return null;

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, rows[0].conversationId));

    return rowToModel(rows[0]);
  },
  async delete(id: string) {
    const rows = await db
      .delete(messages)
      .where(eq(messages.id, id))
      .returning({ id: messages.id, conversationId: messages.conversationId });
    if (rows.length === 0) return false;

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, rows[0].conversationId));

    return true;
  },

  async upsertByExternalId(input: CreateMessageInput) {
    if (!input.externalId) {
      throw new Error("externalId is required for upsertByExternalId");
    }

    const insertValues = buildInsertValues({ ...input, externalId: input.externalId });
    const updateValues = buildUpdateValues(input);

    const row = await db
      .insert(messages)
      .values(insertValues as typeof messages.$inferInsert)
      .onConflictDoUpdate({
        target: messages.externalId,
        set: Object.keys(updateValues).length > 0 ? updateValues : { externalId: input.externalId },
      })
      .returning()
      .then((rows) => rows[0]);

    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, input.conversationId));

    return rowToModel(row);
  },
});
