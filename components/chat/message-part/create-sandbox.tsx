import { CheckIcon, XIcon } from "lucide-react";

import type { DataPart } from "@/ai/messages/data-parts";

import { ToolHeader } from "../tool-header";
import { ToolMessage } from "../tool-message";
import { Spinner } from "./spinner";

interface Props {
  message: DataPart["create-sandbox"];
}

export function CreateSandbox({ message }: Props) {
  return (
    <ToolMessage>
      <ToolHeader>Create Sandbox</ToolHeader>

      <div className="relative pl-6 min-h-5">
        <Spinner className="absolute left-0 top-0" loading={message.status === "loading"}>
          {message.status === "error" ? (
            <XIcon className="w-4 h-4 text-red-700" />
          ) : (
            <CheckIcon className="w-4 h-4" />
          )}
        </Spinner>
        <span>
          {message.status === "done" && "Sandbox created successfully"}
          {message.status === "loading" && "Creating Sandbox"}
          {message.status === "error" && "Failed to create sandbox"}
        </span>
      </div>
    </ToolMessage>
  );
}
