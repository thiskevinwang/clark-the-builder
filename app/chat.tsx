"use client";

import { useChat, type Chat as SharedChat } from "@ai-sdk/react";
import { ArrowUpIcon, StopCircleIcon } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message } from "@/components/chat/message";
import type { ChatUIMessage } from "@/components/chat/types";
import { ConnectorsMenu } from "@/components/connectors/connectors-menu";
import { Panel } from "@/components/panels/panels";
import { ModelSelector } from "@/components/settings/model-selector";
import { Settings } from "@/components/settings/settings";
import { useSettings } from "@/components/settings/use-settings";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { PENDING_WELCOME_PROMPT_KEY, useSharedChatContext } from "@/lib/chat-context";
import { useLocalStorageValue } from "@/lib/use-local-storage-value";

import { useSandboxStore } from "./state";

interface Props {
  className: string;
  modelId?: string;
}

export function Chat({ className }: Props) {
  const { chat } = useSharedChatContext();

  if (!chat) {
    return (
      <Panel className={className} variant="ghost">
        <div className="p-4 text-sm text-muted-foreground">Loading chat…</div>
      </Panel>
    );
  }

  return <ChatWithChat className={className} chat={chat} />;
}

function ChatWithChat({ className, chat }: { className: string; chat: SharedChat<ChatUIMessage> }) {
  const [input, setInput] = useLocalStorageValue("prompt-input");
  const { modelId, reasoningEffort } = useSettings();
  const { messages, sendMessage, status, stop } = useChat<ChatUIMessage>({ chat });

  const hasHandledPendingPromptRef = useRef(false);

  const { setChatStatus } = useSandboxStore();

  const validateAndSubmitMessage = useCallback(
    (text: string) => {
      if (text.trim()) {
        sendMessage({ text }, { body: { modelId, reasoningEffort } });
        setInput("");
        // Optimistically update the messages list
        // https://swr.vercel.app/examples/optimistic-ui

        // const optimistic = {
        //   messages: [
        //     ...(data?.messages ?? []),
        //     { id: `temp-${Date.now()}`, role: "user", parts: [{ type: "text", text }] },
        //   ],
        // };

        // mutate(optimistic, {
        //   optimisticData: optimistic,
        //   populateCache: true,
        //   revalidate: false,
        // });
      }
    },
    [sendMessage, modelId, setInput, reasoningEffort],
  );

  useEffect(() => {
    setChatStatus(status);
  }, [status, setChatStatus]);

  useEffect(() => {
    if (hasHandledPendingPromptRef.current) return;
    if (status !== "ready") return;
    if (messages.length > 0) {
      // If the chat already has content, don't auto-send anything.
      hasHandledPendingPromptRef.current = true;
      try {
        const raw = sessionStorage.getItem(PENDING_WELCOME_PROMPT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { chatId?: string; prompt?: string };
          if (parsed?.chatId === (chat as unknown as { id?: string })?.id) {
            sessionStorage.removeItem(PENDING_WELCOME_PROMPT_KEY);
          }
        }
      } catch {
        // ignore
      }
      return;
    }

    try {
      const raw = sessionStorage.getItem(PENDING_WELCOME_PROMPT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { chatId?: string; prompt?: string };

      const chatId = (chat as unknown as { id?: string })?.id;
      if (!parsed?.prompt?.trim()) return;
      if (!chatId || parsed.chatId !== chatId) return;

      hasHandledPendingPromptRef.current = true;
      sessionStorage.removeItem(PENDING_WELCOME_PROMPT_KEY);
      sendMessage({ text: parsed.prompt }, { body: { modelId, reasoningEffort } });
    } catch {
      // ignore
    }
  }, [chat, messages.length, modelId, reasoningEffort, sendMessage, status]);

  return (
    <Panel className={className} variant="ghost">
      {/* Messages Area */}
      <Conversation className="relative w-full">
        <ConversationContent className="space-y-4">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <form
        className="m-2"
        onSubmit={async (event) => {
          event.preventDefault();
          validateAndSubmitMessage(input);
        }}
      >
        <InputGroup className="bg-card">
          <InputGroupTextarea
            disabled={status === "streaming" || status === "submitted"}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                validateAndSubmitMessage(input);
              }
            }}
            placeholder="Ask a follow-up..."
            rows={2}
            value={input}
            className="text-base max-h-50 overflow-y-auto"
          />
          <InputGroupAddon align="block-end">
            <div className="flex items-center gap-1">
              <Settings />

              <ConnectorsMenu />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ModelSelector />

              {status === "ready" && (
                <InputGroupButton
                  type="submit"
                  size="sm"
                  variant="ghost"
                  disabled={!input.trim()}
                  className="h-9 w-9 p-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 disabled:bg-muted disabled:text-muted-foreground transition-all"
                >
                  <ArrowUpIcon className="w-4 h-4" />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              )}
              {(status === "streaming" || status === "submitted") && (
                <InputGroupButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => stop()}
                  className="h-9 w-9 p-0 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all"
                >
                  <StopCircleIcon className="w-4 h-4" />
                  <span className="sr-only">Stop</span>
                </InputGroupButton>
              )}
            </div>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </Panel>
  );
}
