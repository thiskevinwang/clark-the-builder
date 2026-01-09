import type { ReasoningUIPart } from "ai";
import { BrainIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { Streamdown } from "streamdown";

import { useReasoningContext } from "../message";
import { MessageSpinner } from "../message-spinner";

export function Reasoning({ part, partIndex }: { part: ReasoningUIPart; partIndex: number }) {
  const context = useReasoningContext();
  const isExpanded = context?.expandedReasoningIndex === partIndex;

  if (part.state === "done" && !part.text) {
    return null;
  }

  const text = part.text || "_Thinking_";
  const isStreaming = part.state === "streaming";
  const firstLine = text.split("\n")[0].replace(/\*\*/g, "");
  const hasMoreContent = text.includes("\n") || text.length > 80;

  const handleClick = () => {
    if (hasMoreContent && context) {
      const newIndex = isExpanded ? null : partIndex;
      context.setExpandedReasoningIndex(newIndex);
    }
  };

  return (
    <div
      className="text-sm border border-border bg-background rounded-md cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={handleClick}
    >
      {/* Reasoning header */}
      <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground border-b border-border/50">
        <BrainIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium">{isStreaming ? "Reasoning..." : "Reasoned"}</span>
        {hasMoreContent && (
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </div>
        )}
      </div>
      {/* Reasoning content */}
      <div className="px-3 py-2">
        <div className="text-secondary-foreground font-mono leading-normal text-xs">
          {isExpanded || !hasMoreContent ? (
            <Streamdown>{text}</Streamdown>
          ) : (
            <div className="overflow-hidden truncate">{firstLine}</div>
          )}
          {isStreaming && isExpanded && <MessageSpinner />}
        </div>
      </div>
    </div>
  );
}
