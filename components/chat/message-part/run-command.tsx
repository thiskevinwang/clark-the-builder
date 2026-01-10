import { CheckIcon, XIcon } from "lucide-react";
import { Streamdown } from "streamdown";

import type { DataPart } from "@/ai/messages/data-parts";

import { ToolHeader } from "../tool-header";
import { ToolMessage } from "../tool-message";
import { Spinner } from "./spinner";

export function RunCommand({ message }: { message: DataPart["run-command"] }) {
  return (
    <ToolMessage>
      <ToolHeader>Run command</ToolHeader>
      <div className="relative pl-6">
        <Spinner
          className="absolute left-0 top-0"
          loading={["executing", "waiting"].includes(message.status)}
        >
          {(message.exitCode && message.exitCode > 0) || message.status === "error" ? (
            <XIcon className="w-4 h-4 text-red-700" />
          ) : (
            <CheckIcon className="w-4 h-4" />
          )}
        </Spinner>
        <Streamdown>{`\`${message.command} ${message.args.join(" ")}\``}</Streamdown>
      </div>
      <small className="text-xs text-muted-foreground">{message.status}</small>
    </ToolMessage>
  );
}
