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
  if (part.type === "data-create-clerk-app") {
    return <CreateClerkApp message={part.data} />;
  } else if (part.type === "data-generating-files") {
    return <GenerateFiles message={part.data} />;
  } else if (part.type === "data-create-sandbox") {
    return <CreateSandbox message={part.data} />;
  } else if (part.type === "data-get-sandbox-url") {
    return <GetSandboxURL message={part.data} />;
  } else if (part.type === "data-run-command") {
    return <RunCommand message={part.data} />;
  } else if (part.type === "reasoning") {
    return <Reasoning part={part} partIndex={partIndex} />;
  } else if (part.type === "data-report-errors") {
    return <ReportErrors message={part.data} />;
  } else if (part.type === "text") {
    return <TextPart part={part} />;
  } else if (part.type === "dynamic-tool") {
    return <ToolInvocation part={part} />;
  }
  return null;
});
