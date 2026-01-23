export interface Resource {
  id: string;
  type: string;
  externalId: string;
  conversationId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceInput {
  type: string;
  externalId: string;
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateResourceInput {
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
}
