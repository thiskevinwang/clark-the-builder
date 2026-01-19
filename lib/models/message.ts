import { UIMessage } from "ai";

export type MessageRole = "system" | "user" | "assistant" | "developer" | "tool";

/** A persisted conversation entry (UI message or session event). */
export interface Message {
  id: UIMessage["id"];
  conversationId: string;
  role?: MessageRole | null;
  createdAt: Date;
  updatedAt: Date;
  parts: UIMessage["parts"];
  metadata: Record<string, unknown>;
  parentId?: string | null;
  // An optional external ID:
  // eg. OpenAI tool call id: `call_1234`
  // eg. Anthropic tool call id: `toolu_1234`
  externalId?: string;
}

export interface CreateMessageInput {
  id?: UIMessage["id"];
  conversationId: string;
  role?: MessageRole | null;
  parts?: UIMessage["parts"];
  metadata?: Record<string, unknown>;
  parentId?: string | null;
  externalId?: string;
}

export interface UpdateMessageInput {
  role?: MessageRole | null;
  parts?: UIMessage["parts"];
  metadata?: Record<string, unknown>;
  parentId?: string | null;
  externalId?: string;
}
