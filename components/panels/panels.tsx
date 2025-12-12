import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
  variant?: "default" | "ghost";
}

export function Panel({ className, children, variant = "default" }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col relative w-full h-full rounded-lg overflow-hidden",
        variant === "default" && "border border-border bg-card shadow-sm",
        variant === "ghost" && "bg-transparent border-none shadow-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ className, children }: Props) {
  return (
    <div
      className={cn(
        "text-sm flex items-center border-b border-border px-3 py-2 text-foreground bg-secondary/50",
        className
      )}
    >
      {children}
    </div>
  );
}
