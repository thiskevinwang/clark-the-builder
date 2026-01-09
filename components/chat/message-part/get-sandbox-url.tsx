import { CheckIcon } from "lucide-react";

import type { DataPart } from "@/ai/messages/data-parts";

import { ToolHeader } from "../tool-header";
import { ToolMessage } from "../tool-message";
import { Spinner } from "./spinner";

export function GetSandboxURL({ message }: { message: DataPart["get-sandbox-url"] }) {
  return (
    <ToolMessage>
      <ToolHeader>Sandbox URL</ToolHeader>
      <div className="relative pl-6 min-h-5">
        <Spinner className="absolute left-0 top-0" loading={message.status === "loading"}>
          <CheckIcon className="w-4 h-4" />
        </Spinner>
        {message.url ? (
          <a href={message.url} target="_blank">
            {message.url}
          </a>
        ) : (
          <span>Getting Sandbox URL</span>
        )}
      </div>
    </ToolMessage>
  );
}
