import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ToolMessage(props: { className?: string; children: ReactNode }) {
  return (
    <div
      data-component={"ToolMessage"}
      className={cn(
        "text-sm px-3.5 py-3 border border-border bg-card",
        // CSS rules:
        // - first of kind in a list gets top-rounded
        "first-of-type:rounded-t-md",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
