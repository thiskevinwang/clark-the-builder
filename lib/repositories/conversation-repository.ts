import type {
  Conversation,
  ConversationWithMessageCount,
  CreateConversationInput,
  UpdateConversationInput,
} from "../models/conversation";

export interface ConversationRepository {
  getById(id: string, userId?: string): Promise<Conversation | null>;
  listRecent(
    limit: number,
    offset?: number,
    query?: string,
    userId?: string,
  ): Promise<Conversation[]>;
  listRecentWithMessageCount(
    limit: number,
    offset?: number,
    query?: string,
    userId?: string,
  ): Promise<ConversationWithMessageCount[]>;
  create(input: CreateConversationInput): Promise<Conversation>;
  update(id: string, input: UpdateConversationInput, userId?: string): Promise<Conversation | null>;
  delete(id: string, userId?: string): Promise<boolean>;
}
