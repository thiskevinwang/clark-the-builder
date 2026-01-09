import type { TextUIPart } from "ai";
import { BotIcon, UserIcon } from "lucide-react";
import { createContext, memo, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { ResponseMessagePart } from "./message-part";
import { TextPart } from "./message-part/text";
import type { ChatUIMessage } from "./types";

interface Props {
  message: ChatUIMessage;
}

interface ReasoningContextType {
  expandedReasoningIndex: number | null;
  setExpandedReasoningIndex: (index: number | null) => void;
}

const ReasoningContext = createContext<ReasoningContextType | null>(null);

export const useReasoningContext = () => {
  const context = useContext(ReasoningContext);
  return context;
};

export const Message = memo(function Message({ message }: Props) {
  const [expandedReasoningIndex, setExpandedReasoningIndex] = useState<number | null>(null);

  const reasoningParts = message.parts
    .map((part, index) => ({ part, index }))
    .filter(({ part }) => part.type === "reasoning");

  useEffect(() => {
    if (reasoningParts.length > 0) {
      const latestReasoningIndex = reasoningParts[reasoningParts.length - 1].index;
      setExpandedReasoningIndex(latestReasoningIndex);
    }
  }, [reasoningParts]);

  const isUserMessage = message.role === "user";

  return (
    <ReasoningContext.Provider value={{ expandedReasoningIndex, setExpandedReasoningIndex }}>
      <div
        className={cn("flex flex-col", {
          "": message.role === "assistant",
          "ml-20 items-end": message.role === "user",
        })}
      >
        {/* Message Header */}
        <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
          {message.role === "user" ? (
            <>
              <div className="ml-auto flex items-center justify-center w-6 h-6 rounded-full bg-secondary">
                <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span>You</span>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                <BotIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span>Assistant</span>
              {message.metadata?.model && (
                <span className="text-xs text-muted-foreground font-normal">
                  ({message.metadata.model})
                </span>
              )}
            </>
          )}
        </div>

        {/* Message Content */}
        <div className="space-y-1.5">
          {message.role === "assistant" &&
            message.parts.map((part, index) => (
              <ResponseMessagePart key={index} part={part} partIndex={index} />
            ))}
          {message.role === "user" && (
            <TextPart
              part={message.parts[0] as TextUIPart}
              className="border border-border bg-accent max-w-96 [&_code]:bg-primary-foreground!"
            />
          )}
        </div>
      </div>
    </ReasoningContext.Provider>
  );
});
