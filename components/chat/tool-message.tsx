import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ToolMessage(props: { className?: string; children: ReactNode }) {
  return (
    <div
      data-component={"ToolMessage"}
      className={cn(
        "text-sm px-3.5 py-3 border border-border bg-background",
        "transition-colors hover:bg-accent/30",
        // CSS rules:
        // - adjacent tool parts merge into one rounded group
        "rounded-md",
        "[&+&]:border-t-0",
        "[&+&]:rounded-t-none",
        "[&:has(+&)]:border-b-0",
        "[&:has(+&)]:rounded-b-none",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
