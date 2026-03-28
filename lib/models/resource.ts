export interface Resource {
  id: string;
  userId: string;
  type: string;
  externalId: string;
  conversationId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceInput {
  userId: string;
  type: string;
  externalId: string;
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateResourceInput {
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
}
