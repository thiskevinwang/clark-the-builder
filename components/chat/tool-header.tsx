import { BrainCog } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ToolHeader(props: { className?: string; children: ReactNode; icon?: ReactNode }) {
  const icon = props.icon ?? <BrainCog className="w-3.5 h-3.5 shrink-0" />;
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-muted-foreground mb-2 font-semibold relative pl-5",
        props.className,
      )}
    >
      <span className="absolute left-0 top-0.5">{icon}</span>
      {props.children}
    </div>
  );
}
