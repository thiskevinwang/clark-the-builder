"use client";

import { Chat } from "@ai-sdk/react";
import { DataUIPart } from "ai";
import { type ReactNode } from "react";
import { createContext, useContext, useMemo, useRef } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

import { DataPart } from "@/ai/messages/data-parts";

import { useDataStateMapper } from "@/app/state";
import { type ChatUIMessage } from "@/components/chat/types";

interface ChatContextValue {
  chat: Chat<ChatUIMessage>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const mapDataToState = useDataStateMapper();
  const mapDataToStateRef = useRef(mapDataToState);
  mapDataToStateRef.current = mapDataToState;

  const chat = useMemo(
    () =>
      new Chat<ChatUIMessage>({
        onToolCall: () => mutate("/api/auth/info"),
        onData: (data) => mapDataToStateRef.current(data as DataUIPart<DataPart>),
        onError: (error) => {
          toast.error(`Communication error with the AI: ${error.message}`);
          console.error("Error sending message:", error);
        },
      }),
    [],
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
