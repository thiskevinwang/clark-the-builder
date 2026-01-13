export interface Conversation {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationInput {
  title?: string | null;
  /** Optional override (normally server-generated). */
  id?: string;
}

export interface UpdateConversationInput {
  title?: string | null;
}
