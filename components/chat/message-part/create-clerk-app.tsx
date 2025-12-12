import type { DataPart } from "@/ai/messages/data-parts";
import { KeyRoundIcon, CheckIcon, XIcon } from "lucide-react";
import { Spinner } from "./spinner";
import { ToolHeader } from "../tool-header";
import { ToolMessage } from "../tool-message";

interface Props {
  message: DataPart["create-clerk-app"];
}

export function CreateClerkApp({ message }: Props) {
  return (
    <ToolMessage>
      <ToolHeader>
        <KeyRoundIcon className="w-3.5 h-3.5" />
        Create Clerk App
      </ToolHeader>
      <div className="relative pl-6 min-h-5">
        <Spinner
          className="absolute left-0 top-0"
          loading={message.status === "loading"}
        >
          {message.status === "error" ? (
            <XIcon className="w-4 h-4 text-red-700" />
          ) : (
            <CheckIcon className="w-4 h-4" />
          )}
        </Spinner>
        <span>
          {message.status === "done" && `Clerk app created: "${message.name}"`}
          {message.status === "loading" &&
            `Creating Clerk app "${message.name}"`}
          {message.status === "error" &&
            `Failed to create Clerk app "${message.name}"`}
        </span>
      </div>
    </ToolMessage>
  );
}
