import { CheckIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Spinner } from "./message-part/spinner";

export function DataPartComponent(props: {
  defaultOpen?: boolean;
  loading?: boolean;
  error?: boolean;
  className?: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <div
      data-component={"DataPart"}
      className={cn(
        "text-sm bg-background cursor-pointer hover:bg-accent/30 transition-colors",
        // CSS rules:
        // - adjacent tool parts merge into one rounded group
        "border border-border rounded-md",
        "[&+&]:border-t-0",
        "[&+&]:rounded-t-none",
        "[&:has(+&)]:border-b-0",
        "[&:has(+&)]:rounded-b-none",
        props.className,
      )}
    >
      <Collapsible defaultOpen={props.defaultOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground relative">
            <div className="pl-5">{props.title}</div>
            <span className="absolute flex items-center justify-center">
              <Spinner className="w-3.5 h-3.5" loading={props.loading}>
                {props.error ? (
                  <XIcon className="w-3.5 h-3.5" />
                ) : (
                  <CheckIcon className="w-3.5 h-3.5" />
                )}
              </Spinner>
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="max-h-50 px-3 pb-2 overflow-y-scroll [&[data-state=open]]:animate-collapsible-down [&[data-state=closed]]:animate-collapsible-up">
          <div className="pl-5 text-xs text-muted-foreground">{props.children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
