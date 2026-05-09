import type { UIMessage } from "ai";

import type { DataPart } from "@/ai/messages/data-parts";
import type { Metadata } from "@/ai/messages/metadata";
import type { ToolSet } from "@/ai/tools";
import type { Message as PersistedMessage } from "@/lib/models/message";

export type ChatUIMessage = UIMessage<Metadata, DataPart, ToolSet>;

export function isChatUIMessageRole(role: PersistedMessage["role"]): role is ChatUIMessage["role"] {
  return role === "assistant" || role === "system" || role === "user";
}

export function toChatUIMessage(message: PersistedMessage): ChatUIMessage | null {
  if (!isChatUIMessageRole(message.role)) {
    return null;
  }

  return {
    id: message.id,
    role: message.role,
    metadata: message.metadata as ChatUIMessage["metadata"],
    parts: message.parts as ChatUIMessage["parts"],
  };
}
