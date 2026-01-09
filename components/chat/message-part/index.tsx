import type { UIMessage } from "ai";
import { memo } from "react";

import type { DataPart } from "@/ai/messages/data-parts";
import type { Metadata } from "@/ai/messages/metadata";
import type { ToolSet } from "@/ai/tools";

import { CreateClerkApp } from "./create-clerk-app";
import { CreateSandbox } from "./create-sandbox";
import { GenerateFiles } from "./generate-files";
import { GetSandboxURL } from "./get-sandbox-url";
import { Reasoning } from "./reasoning";
import { ReportErrors } from "./report-errors";
import { RunCommand } from "./run-command";
import { TextPart } from "./text";
import { ToolInvocation } from "./tool-invocation";

interface Props {
  part: UIMessage<Metadata, DataPart, ToolSet>["parts"][number];
  partIndex: number;
}

export const ResponseMessagePart = memo(function MessagePart({ part, partIndex }: Props) {
  switch (part.type) {
    case "step-start" /* https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage#step-start-parts */:
      // show step boundaries as horizontal lines:
      return partIndex > 0 ? (
        <div key={partIndex}>
          <hr className="my-2 border-border border-dashed" />
        </div>
      ) : null;
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
    case "reasoning":
      return <Reasoning part={part} partIndex={partIndex} />;
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
