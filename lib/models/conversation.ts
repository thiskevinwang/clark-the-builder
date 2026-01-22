export interface Conversation {
  id: string;
  userId: string | null;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessageCount extends Conversation {
  /** Total persisted messages in this conversation. */
  messageCount: number;
}

export interface CreateConversationInput {
  userId?: string | null;
  title?: string | null;
  /** Optional override (normally server-generated). */
  id?: string;
}

export interface UpdateConversationInput {
  title?: string | null;
}
