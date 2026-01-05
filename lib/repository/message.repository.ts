import { eq } from "drizzle-orm";

import type { DB } from "@/lib/db/db";
import { getClient } from "@/lib/db/drizzle/client";
import * as schema from "@/lib/db/drizzle/schema";
import type { MessageModel } from "@/lib/models/message.model";

export class MessageRepository {
  async insertMessageByChatId(
    db: DB,
    chatId: string,
    message: Omit<MessageModel, "chatId">
  ): Promise<MessageModel> {
    const res = await getClient(db)
      .insert(schema.messagesTable)
      .values({ ...message, chatId })
      .returning();

    return {
      id: res[0].id,
      chatId: res[0].chatId,
      content: res[0].content,
      role: res[0].role as "user" | "assistant",
      createdAt: res[0].createdAt,
      updatedAt: res[0].updatedAt,
    };
  }

  async queryAllMessagesByChatId(
    db: DB,
    chatId: string
  ): Promise<MessageModel[]> {
    const res = await getClient(db)
      .select()
      .from(schema.messagesTable)
      .where(eq(schema.messagesTable.chatId, chatId));
    return res.map((message) => ({
      id: message.id,
      chatId: message.chatId,
      content: message.content,
      role: message.role as "user" | "assistant",
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));
  }
}
