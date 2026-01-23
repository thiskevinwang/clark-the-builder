import type { UIMessage } from "ai";
import { ChevronDown, WrenchIcon, ZapIcon } from "lucide-react";
import { memo } from "react";
import { Streamdown } from "streamdown";

import type { DataPart } from "@/ai/messages/data-parts";
import type { Metadata } from "@/ai/messages/metadata";
import type { ToolSet } from "@/ai/tools";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { CreateClerkApp } from "./create-clerk-app";
import { CreateSandbox } from "./create-sandbox";
import { GenerateFiles } from "./generate-files";
import { GetSandboxURL } from "./get-sandbox-url";
import { ReportErrors } from "./report-errors";
import { RunCommand } from "./run-command";
import { TextPart } from "./text";

interface Props {
  part: UIMessage<Metadata, DataPart, ToolSet>["parts"][number];
  partIndex: number;
}

function tryMapToolToName(partType: string): string | null {
  const mapping: Record<string, string> = {
    "tool-createClerkApp": "Provision Clerk Application",
    "tool-createSandbox": "Create Sandbox Environment",
    "tool-getSandboxURL": "Get Sandbox URL",
    "tool-runCommand": "Run Command",
    "tool-generateFiles": "Generate Files",
    "tool-waitTool": "Wait",
  };
  return mapping[partType] || partType;
}

export const MessagePart = memo(function _MessagePart({ part, partIndex }: Props) {
  if (part.type === "reasoning") {
    // Cursed classnames
    if (!part.text) return null;
    return (
      <details
        data-part="reasoning"
        className={cn(
          "my-2 text-sm bg-background transition-colors",
          // if open, rotate data-chevron
          "[&[open]_[data-chevron]]:rotate-180",
        )}
      >
        {/* Hide summary on subsequent adjacent reasoning parts */}
        <summary
          className={cn(
            "hover:bg-accent/30 rounded-lg cursor-pointer transition-colors",
            "flex items-center gap-2 px-3 py-2 text-muted-foreground relative list-none [&::-webkit-details-marker]:hidden",
            "[[data-part=reasoning]+[data-part=reasoning]_&]:hidden",
          )}
        >
          <div className="pl-5">Reasoning</div>
          <span className="absolute l-0">
            <ChevronDown className="w-3.5 h-3.5 shrink-0" data-chevron />
          </span>
        </summary>
        {part.text && (
          <div
            data-content
            className={cn(
              "px-3",
              // Continuous padding: no pb on non-last, no pt on non-first
              "[details[data-part=reasoning]:has(+[data-part=reasoning])>&]:pb-0",
              "[[data-part=reasoning]+[data-part=reasoning]>&]:pt-0",
              // Last in series gets bottom padding
              "[details[data-part=reasoning]:not(:has(+[data-part=reasoning]))>&]:pb-2",
            )}
          >
            <div className="relative">
              <Streamdown
                className={cn(
                  "pl-5 whitespace-pre-wrap wrap-anywhere text-xs **:text-xs! text-muted-foreground",
                  "**:data-[streamdown='code-block-header']:p-1 **:data-[streamdown='code-block-body']:p-1",
                )}
              >
                {part.text}
              </Streamdown>
              <div className="absolute ml-1 left-0 h-full w-px bg-muted top-0" />
            </div>
          </div>
        )}
      </details>
    );
  }

  if (part.type === "dynamic-tool") {
    const text = part.output?.content?.[0].text;
    return (
      <div
        className={cn(
          "text-sm bg-background cursor-pointer hover:bg-accent/30 transition-colors",
          // CSS rules:
          // - adjacent tool parts merge into one rounded group
          "border border-border rounded-md",
          "[&+&]:border-t-0",
          "[&+&]:rounded-t-none",
          "[&:has(+&)]:border-b-0",
          "[&:has(+&)]:rounded-b-none",
        )}
      >
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground relative">
              <div className="pl-5">{part.toolName}</div>
              <span className="absolute">
                <ZapIcon className="w-3.5 h-3.5 shrink-0" />
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {text && (
              <Streamdown className="pl-5 whitespace-pre-wrap wrap-anywhere text-xs **:text-xs! text-muted-foreground">
                {text}
              </Streamdown>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // tool- parts
  if (part.type.startsWith("tool-")) {
    return null;
    return (
      <div
        className={cn(
          "text-sm bg-background cursor-pointer hover:bg-accent/30 transition-colors",
          // CSS rules:
          // - adjacent tool parts merge into one rounded group
          "border border-border rounded-md",
          "[&+&]:border-t-0",
          "[&+&]:rounded-t-none",
          "[&:has(+&)]:border-b-0",
          "[&:has(+&)]:rounded-b-none",
        )}
      >
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground relative">
              <div className="pl-5">{tryMapToolToName(part.type)}</div>
              <span className="absolute">
                <WrenchIcon className="w-3.5 h-3.5 shrink-0" />
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="max-h-50 px-3 pb-2 overflow-y-scroll [&[data-state=open]]:animate-collapsible-down [&[data-state=closed]]:animate-collapsible-up">
            <div className="relative">
              <Streamdown className="pl-5 whitespace-pre-wrap wrap-anywhere text-xs **:text-xs! text-muted-foreground">
                {part.output
                  ? typeof part.output === "string"
                    ? part.output
                    : JSON.stringify(part.output)
                  : null}
              </Streamdown>
              <div className="absolute ml-1 left-0 h-full w-px bg-muted top-0" />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  switch (part.type) {
    case "data-create-clerk-app":
      return <CreateClerkApp message={part.data} />;
    case "data-generating-files":
      return <GenerateFiles message={part.data} />;
    case "data-create-sandbox":
      return <CreateSandbox message={part.data} />;
    case "data-get-sandbox-url":
      return <GetSandboxURL message={part.data} />;
    case "data-run-command":
      return <RunCommand message={part.data} />;
    case "data-report-errors":
      return <ReportErrors message={part.data} />;
    case "text":
      return <TextPart part={part} />;
    default:
      return null;
  }
});
