import { eq } from "drizzle-orm";

import type { DB } from "@/lib/db/db";
import { getClient } from "@/lib/db/drizzle/client";
import * as schema from "@/lib/db/drizzle/schema";
import type { ChatModel } from "@/lib/models/chat.model";

export class ChatRepository {
  async insertChat(db: DB, chat: ChatModel): Promise<ChatModel> {
    const res = await getClient(db)
      .insert(schema.chatsTable)
      .values(chat)
      .returning();
    return res[0];
  }

  async queryAllChats(db: DB): Promise<ChatModel[]> {
    const res = await getClient(db).select().from(schema.chatsTable);
    return res;
  }

  async queryChatById(db: DB, id: string): Promise<ChatModel | null> {
    const res = await getClient(db)
      .select()
      .from(schema.chatsTable)
      .where(eq(schema.chatsTable.id, id));
    return res[0];
  }
}
