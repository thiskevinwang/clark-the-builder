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
      className={cn("px-3.5 py-3 rounded-md overflow-x-auto", className)}
    >
      <Streamdown className="**:text-sm">{part.text}</Streamdown>
    </div>
  );
}
