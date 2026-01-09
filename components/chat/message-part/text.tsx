import type { TextUIPart } from "ai";
import { Streamdown } from "streamdown";

import { cn } from "@/lib/utils";

/**
 * A text part
 */
export function TextPart({ className, part }: { className?: string; part: TextUIPart }) {
  return (
    <div
      data-component={"Text"}
      className={cn("text-sm px-3.5 py-3 bg-background rounded-md overflow-x-auto", className)}
    >
      <Streamdown>{part.text}</Streamdown>
    </div>
  );
}
