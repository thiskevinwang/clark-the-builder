import { UIMessage } from "ai";

/** A persisted UI message belonging to a conversation. */
export interface Message {
  id: UIMessage["id"];
  conversationId: string;
  role: UIMessage["role"];
  createdAt: Date;
  updatedAt: Date;
  parts: UIMessage["parts"];
  metadata: Record<string, unknown>;
  // An optional external ID:
  // eg. OpenAI tool call id: `call_1234`
  // eg. Anthropic tool call id: `toolu_1234`
  externalId?: string;
}

export interface CreateMessageInput {
  id?: UIMessage["id"];
  conversationId: string;
  role: UIMessage["role"];
  parts: UIMessage["parts"];
  metadata?: Record<string, unknown>;
  externalId?: string;
}

export interface UpdateMessageInput {
  parts?: UIMessage["parts"];
  metadata?: Record<string, unknown>;
  externalId?: string;
}
