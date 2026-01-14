import type {
  Conversation,
  ConversationWithMessageCount,
  CreateConversationInput,
  UpdateConversationInput,
} from "../models/conversation";

export interface ConversationRepository {
  getById(id: string): Promise<Conversation | null>;
  listRecent(limit: number, offset?: number, query?: string): Promise<Conversation[]>;
  listRecentWithMessageCount(
    limit: number,
    offset?: number,
    query?: string,
  ): Promise<ConversationWithMessageCount[]>;
  create(input: CreateConversationInput): Promise<Conversation>;
  update(id: string, input: UpdateConversationInput): Promise<Conversation | null>;
  delete(id: string): Promise<boolean>;
}
