import { ChevronsUpDown } from "lucide-react";
import { createContext, memo, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { MessagePart } from "./message-part";
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

  const [debug, setDebug] = useState(false);

  return (
    <ReasoningContext.Provider value={{ expandedReasoningIndex, setExpandedReasoningIndex }}>
      <div
        className={cn("flex flex-col", {
          "ml-20 items-end": message.role === "user",
          '[&_[data-component="Text"]]:bg-accent!': message.role === "user",
        })}
      >
        {/* Message Content */}
        <div data-component="MessageContent" className="max-w-full">
          {message.parts.map((part, index) => (
            <MessagePart key={index} part={part} partIndex={index} />
          ))}
        </div>

        <Collapsible open={debug} onOpenChange={setDebug} className="mt-1">
          <div className="flex justify-end items-center space-x-1 mb-2">
            <code className="text-xs text-muted-foreground">Raw</code>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6 text-muted-foreground">
                <ChevronsUpDown />
                {/* TODO/BuggyUX: this causes the Conversation to have extra bottom space as well as a extra Y scroll bar. */}
                {/* <span className="sr-only">Toggle</span> */}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="overflow-hidden [&[data-state=open]]:animate-collapsible-down [&[data-state=closed]]:animate-collapsible-up">
            <pre className="text-xs overflow-x-auto bg-muted p-2">
              {JSON.stringify(message, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ReasoningContext.Provider>
  );
});
