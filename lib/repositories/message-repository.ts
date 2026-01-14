import type { CreateMessageInput, Message, UpdateMessageInput } from "../models/message";

export interface MessageRepository {
  getById(id: string): Promise<Message | null>;
  listByConversationId(conversationId: string): Promise<Message[]>;
  create(input: CreateMessageInput): Promise<Message>;
  update(id: string, input: UpdateMessageInput): Promise<Message | null>;
  delete(id: string): Promise<boolean>;
  upsertByExternalId(input: CreateMessageInput): Promise<Message>;
}
