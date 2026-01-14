"use client";

import { Chat } from "@ai-sdk/react";
import { DataUIPart, DefaultChatTransport } from "ai";
import { useParams } from "next/navigation";
import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { DataPart } from "@/ai/messages/data-parts";

import { useDataStateMapper } from "@/app/state";
import { type ChatUIMessage } from "@/components/chat/types";

import { genMessageId } from "./identifiers/generator";

interface ChatContextValue {
  chat: Chat<ChatUIMessage> | null;
  chatId: string | null;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const PENDING_WELCOME_PROMPT_KEY = "pending-welcome-prompt";

const EMPTY_MESSAGES: ChatUIMessage[] = [];

/**
 * https://ai-sdk.dev/cookbook/next/use-shared-chat-context
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const params = useParams<{ chatId?: string }>();
  const chatId = params?.chatId ?? null;

  const listMessagesQuery = useSWR(
    chatId ? `/api/chats/${chatId}/messages` : null,
    async (key) => {
      const res = await fetch(key);
      if (!res.ok) {
        const error = new Error(`Failed to load messages (${res.status})`);
        (error as Error & { status?: number }).status = res.status;
        throw error;
      }
      return res.json();
    },
    {
      fallbackData: { messages: [] },
    },
  );

  const mapDataToState = useDataStateMapper();
  const mapDataToStateRef = useRef(mapDataToState);
  mapDataToStateRef.current = mapDataToState;

  const transport = useMemo(() => {
    if (!chatId) return null;

    return new DefaultChatTransport({
      api: "/api/chat",
      body: {
        chatId,
      },
      prepareSendMessagesRequest: async ({ id: conversationId, messages, body }) => {
        // Persist the user message immediately
        //        await createMessageMutation.trigger({ message: messages[messages.length - 1] });
        return {
          body: {
            ...(body ?? {}),
            chatId: conversationId,
            messages,
          },
        };
      },
    });
  }, [chatId]);

  const messages = chatId ? (listMessagesQuery.data?.messages ?? EMPTY_MESSAGES) : EMPTY_MESSAGES;

  const chat = useMemo(() => {
    if (!chatId || !transport) return null;

    return new Chat<ChatUIMessage>({
      messages,
      generateId: genMessageId,
      id: chatId,
      transport,
      onData: (data) => {
        mapDataToStateRef.current(data as DataUIPart<DataPart>);
      },
      onError: (error) => {
        toast.error(`Communication error with the AI: ${error.message}`);
        console.error("Error sending message:", error);
      },
    });
  }, [chatId, transport, messages]);

  return (
    <ChatContext.Provider value={{ chat, chatId: chatId ?? null }}>{children}</ChatContext.Provider>
  );
}

export function useSharedChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useSharedChatContext must be used within a ChatProvider");
  }
  return context;
}
