import type {
  Conversation,
  ConversationWithMessageCount,
  CreateConversationInput,
  UpdateConversationInput,
} from "../models/conversation";

export interface ConversationRepository {
  getById(userId: string, id: string): Promise<Conversation | null>;
  listRecent(
    userId: string,
    limit: number,
    offset?: number,
    query?: string,
  ): Promise<Conversation[]>;
  listRecentWithMessageCount(
    userId: string,
    limit: number,
    offset?: number,
    query?: string,
  ): Promise<ConversationWithMessageCount[]>;
  create(input: CreateConversationInput): Promise<Conversation>;
  update(userId: string, id: string, input: UpdateConversationInput): Promise<Conversation | null>;
  delete(userId: string, id: string): Promise<boolean>;
  deleteMany(userId: string, ids: string[]): Promise<string[]>;
}
