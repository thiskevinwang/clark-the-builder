"use client";

import { Chat } from "@ai-sdk/react";
import { DataUIPart, DefaultChatTransport } from "ai";
import { useParams, usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { DataPart } from "@/ai/messages/data-parts";

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
  const params = useParams<{ chatId: string }>();
  const [chatId, setChatId] = useState(() => params.chatId);
  const pathname = usePathname();

  const createChatMutation = useSWRMutation<
    { chat: { id: string } },
    unknown,
    string,
    { title?: string }
  >("/api/chats", async (url, { arg }) => {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ title: arg?.title ?? "New Chat" }),
    });
    return res.json();
  });

  useEffect(() => {
    // Only auto-create a chat on the welcome screen.
    // Visiting /chats (the list/search page) shouldn't create empty conversations.
    if (!chatId && pathname === "/") {
      createChatMutation.trigger({ title: "New Chat" }).then((data) => {
        setChatId(data.chat.id);
      });
    }
  }, [chatId, pathname, createChatMutation]);

  const listMessagesQuery = useSWR(
    chatId ? `/api/chats/${chatId}/messages` : null,
    (key) => fetch(key).then((res) => res.json()),
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

  const chat = useMemo(() => {
    if (!chatId || !transport) return null;

    return new Chat<ChatUIMessage>({
      messages: listMessagesQuery.data.messages,
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
  }, [
    chatId,
    transport,
    listMessagesQuery.data.messages?.[listMessagesQuery.data.messages?.length - 1]?.id,
  ]);

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
