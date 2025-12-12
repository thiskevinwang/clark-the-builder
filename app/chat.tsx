"use client";

import { TEST_PROMPTS } from "@/ai/constants";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message } from "@/components/chat/message";
import type { ChatUIMessage } from "@/components/chat/types";
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
import { useSharedChatContext } from "@/lib/chat-context";
import { useLocalStorageValue } from "@/lib/use-local-storage-value";
import { useChat } from "@ai-sdk/react";
import { ArrowUpIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useSandboxStore } from "./state";

interface Props {
  className: string;
  modelId?: string;
}

export function Chat({ className }: Props) {
  const [input, setInput] = useLocalStorageValue("prompt-input");
  const { chat } = useSharedChatContext();
  const { modelId, reasoningEffort } = useSettings();
  const { messages, sendMessage, status } = useChat<ChatUIMessage>({ chat });
  const { setChatStatus } = useSandboxStore();

  const validateAndSubmitMessage = useCallback(
    (text: string) => {
      if (text.trim()) {
        sendMessage({ text }, { body: { modelId, reasoningEffort } });
        setInput("");
      }
    },
    [sendMessage, modelId, setInput, reasoningEffort]
  );

  useEffect(() => {
    setChatStatus(status);
  }, [status, setChatStatus]);

  return (
    <Panel className={className} variant="ghost">
      {/* <PanelHeader>
        <div className="flex items-center font-medium">
          <MessageCircleIcon className="mr-2 w-4 text-primary" />
          Chat
        </div>
        <div className="ml-auto text-xs text-muted-foreground">{status}</div>
      </PanelHeader> */}

      {/* Messages Area */}
      {messages.length === 0 ? (
        <div className="flex-1 min-h-0">
          <div className="flex flex-col justify-center items-center h-full text-sm text-muted-foreground">
            <p className="flex items-center font-medium text-foreground mb-3">
              Try one of these prompts:
            </p>
            <ul className="p-4 space-y-2 text-center max-w-md">
              {TEST_PROMPTS.map((prompt, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2.5 rounded-lg border border-border bg-card shadow-sm cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground hover:border-primary/30"
                  onClick={() => validateAndSubmitMessage(prompt)}
                >
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <Conversation className="relative w-full">
          <ConversationContent className="space-y-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      )}

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
          />
          <InputGroupAddon align="block-end">
            <Settings />

            <ModelSelector />

            {/* <Separator orientation="vertical" className="h-4!" /> */}

            <InputGroupButton
              type="submit"
              size="sm"
              variant="ghost"
              disabled={status !== "ready" || !input.trim()}
              className="ml-auto h-8 w-8 p-0 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <ArrowUpIcon className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </Panel>
  );
}
