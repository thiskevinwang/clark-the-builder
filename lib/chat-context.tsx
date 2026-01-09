"use client";

import { Chat } from "@ai-sdk/react";
import { DataUIPart, DefaultChatTransport } from "ai";
import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

import { DataPart } from "@/ai/messages/data-parts";

import { useDataStateMapper } from "@/app/state";
import { type ChatUIMessage } from "@/components/chat/types";
import { useMCPConnectors } from "@/components/connectors/use-mcp-connectors";

interface ChatContextValue {
  chat: Chat<ChatUIMessage>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { connectors } = useMCPConnectors();
  const mapDataToState = useDataStateMapper();
  const mapDataToStateRef = useRef(mapDataToState);
  mapDataToStateRef.current = mapDataToState;

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: "/api/chat",
      body: {
        connectors,
      },
    });
  }, [JSON.stringify(connectors)]);

  const chat = useMemo(
    () =>
      new Chat<ChatUIMessage>({
        transport,
        onToolCall: () => mutate("/api/auth/info"),
        onData: (data) => mapDataToStateRef.current(data as DataUIPart<DataPart>),
        onError: (error) => {
          toast.error(`Communication error with the AI: ${error.message}`);
          console.error("Error sending message:", error);
        },
      }),
    [transport],
  );

  return <ChatContext.Provider value={{ chat }}>{children}</ChatContext.Provider>;
}

export function useSharedChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useSharedChatContext must be used within a ChatProvider");
  }
  return context;
}
