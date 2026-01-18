import type { UIMessage } from "ai";
import { BrainIcon, WrenchIcon } from "lucide-react";
import { memo } from "react";

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
import { ToolInvocation } from "./tool-invocation";

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
  // tool- parts
  if (part.type.startsWith("tool-")) {
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
              <span className="absolute l-0">
                <WrenchIcon className="w-3.5 h-3.5 shrink-0" />
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="max-h-50 px-3 pb-2 overflow-y-scroll [&[data-state=open]]:animate-collapsible-down [&[data-state=closed]]:animate-collapsible-up">
            <div className="relative">
              <p className="pl-5 whitespace-pre-wrap wrap-anywhere text-xs text-muted-foreground">
                {part.output
                  ? typeof part.output === "string"
                    ? part.output
                    : JSON.stringify(part.output)
                  : null}
              </p>
              <div className="absolute ml-1 left-0 h-full w-px bg-muted top-0" />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
  if (part.type === "reasoning") {
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
        <Collapsible disabled>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground relative">
              <div className="pl-5">Reasoning</div>
              <span className="absolute l-0">
                <BrainIcon className="w-3.5 h-3.5 shrink-0" />
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="max-h-50 px-3 pb-2 overflow-y-scroll [&[data-state=open]]:animate-collapsible-down [&[data-state=closed]]:animate-collapsible-up">
            <div className="relative">
              <p className="pl-5 whitespace-pre-wrap wrap-anywhere text-xs text-muted-foreground">
                {part.text}
              </p>
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
    case "dynamic-tool":
      return <ToolInvocation part={part} />;
    default:
      return null;
  }
});
