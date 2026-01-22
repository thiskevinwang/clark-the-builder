"use client";

import { useChat } from "@ai-sdk/react";
import { ArrowUpIcon, StopCircleIcon } from "lucide-react";
import { useCallback, useEffect } from "react";

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
import { useAuth } from "@/lib/auth";
import { useSharedChatContext } from "@/lib/chat-context";
import { useLocalStorageValue } from "@/lib/use-local-storage-value";
import { cn } from "@/lib/utils";

// Deduplication guard: prevent auto-sending the same prompt multiple times
//
// Notably applicable for React Strict Mode in development, which calls some functions twice
// - https://react.dev/reference/react/StrictMode
const autoSentKeys = new Set<string>();

export function Chat({ className }: { className: string }) {
  const { chat } = useSharedChatContext();
  const [input, setInput] = useLocalStorageValue(`chat:${chat?.id}:prompt-input`);
  const { isLoaded, isSignedIn } = useAuth();

  const { modelId, reasoningEffort } = useSettings();
  const { messages, sendMessage, status, stop } = useChat<ChatUIMessage>({
    chat: chat!,
  });

  const validateAndSubmitMessage = useCallback(
    (text: string) => {
      if (!isLoaded || !isSignedIn) return;
      if (text.trim()) {
        setInput("");
        sendMessage({ text }, { body: { modelId, reasoningEffort } });
      }
    },
    [isLoaded, isSignedIn, modelId, reasoningEffort, sendMessage, setInput],
  );

  useEffect(() => {
    const prompt = input.trim();
    if (!chat?.id) return;
    if (!prompt) return;
    const key = `${chat.id}:${prompt}`;
    if (autoSentKeys.has(key)) {
      setInput("");
      return;
    }
    if (messages.length > 0) return;
    if (status !== "ready") return;
    if (!isLoaded || !isSignedIn) return;

    setInput("");
    localStorage.removeItem(`chat:${chat.id}:prompt-input`);
    autoSentKeys.add(key);
    validateAndSubmitMessage(prompt);
  }, [
    chat?.id,
    input,
    isLoaded,
    isSignedIn,
    messages.length,
    setInput,
    status,
    validateAndSubmitMessage,
  ]);

  return (
    <Panel className={cn("max-w-3xl mx-auto", className)} variant="ghost">
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
            disabled={!isLoaded || !isSignedIn || status === "streaming" || status === "submitted"}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                validateAndSubmitMessage(input);
              }
            }}
            placeholder={!isLoaded || !isSignedIn ? "Sign in to chat..." : "Ask a follow-up..."}
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
                  disabled={!isLoaded || !isSignedIn || !input.trim()}
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
        <p className="text-center text-muted-foreground text-xs mt-2">
          <span className="inline-block dark:hidden">Clark</span>
          <span className="hidden dark:inline-block">Karl</span>&nbsp;is AI and can make mistakes.
          Please double-check responses.
        </p>
      </form>
    </Panel>
  );
}
