"use client";

import { Chat } from "@ai-sdk/react";
import { DataUIPart, DefaultChatTransport } from "ai";
import { useParams } from "next/navigation";
import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { toast } from "sonner";

import { DataPart } from "@/ai/messages/data-parts";

import { useListMessagesQuery } from "@/app/api/hooks";
import { useDataStateMapper } from "@/app/state";
import { type ChatUIMessage } from "@/components/chat/types";

import { genMessageId } from "./identifiers/generator";

interface ChatContextValue {
  chat: Chat<ChatUIMessage> | null;
  chatId: string | null;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

/**
 * https://ai-sdk.dev/cookbook/next/use-shared-chat-context
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const params = useParams<{ chatId?: string }>();
  const chatId = params?.chatId ?? null;

  const listMessagesQuery = useListMessagesQuery(chatId, {
    // Despite the SSR error, "Fallback data is required when using Suspense in SSR."
    // We're omitting fallbackData as we don't know what it might be,
    // and we also want queried data to be defined by the time ChatContext is used.
    suspense: true,
  });

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

  const messageIds = useMemo(() => {
    return (
      listMessagesQuery.data?.messages
        ?.map((m: ChatUIMessage) => m.id)
        .sort((a: string, b: string) => a.localeCompare(b)) ?? null
    );
  }, [
    listMessagesQuery.data?.messages
      ?.map((m: ChatUIMessage) => m.id)
      .sort((a: string, b: string) => a.localeCompare(b))
      .join("|") ?? null,
  ]);

  // Be careful of how we memoize the chat instance to avoid losing state and/or
  // recreating it too often.
  //
  // AFAICT: Chat accepts an existing list of messages but also maintains its own internal state,
  // and reconciles incoming server response messages + data too.
  //
  // It looks like ID's are the key to all of this working smoothly so that's all we'll use to determine memoization.
  const chat = useMemo(() => {
    if (!chatId || !transport) return null;

    return new Chat<ChatUIMessage>({
      messages: listMessagesQuery.data?.messages ?? undefined,
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
  }, [chatId, transport, JSON.stringify(messageIds)]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        chatId: chatId ?? null,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useSharedChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useSharedChatContext must be used within a ChatProvider");
  }
  return context;
}
