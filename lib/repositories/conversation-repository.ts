import type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
} from "../models/conversation";

export interface ConversationRepository {
  getById(id: string): Promise<Conversation | null>;
  listRecent(limit: number, offset?: number, query?: string): Promise<Conversation[]>;
  create(input: CreateConversationInput): Promise<Conversation>;
  update(id: string, input: UpdateConversationInput): Promise<Conversation | null>;
  delete(id: string): Promise<boolean>;
}
