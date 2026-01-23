import { CheckIcon, XIcon } from "lucide-react";

import type { DataPart } from "@/ai/messages/data-parts";

import { DataPartComponent } from "../data-part";
import { Spinner } from "./spinner";

interface Props {
  message: DataPart["generating-files"];
}

export function GenerateFiles({ message }: Props) {
  const lastInProgress = ["error", "uploading", "generating"].includes(message.status);

  const generated = lastInProgress
    ? message.paths.slice(0, message.paths.length - 1)
    : message.paths;

  const generating = lastInProgress ? (message.paths[message.paths.length - 1] ?? "") : null;

  return (
    <DataPartComponent
      title="Generate Files"
      loading={message.status == "generating" || message.status == "uploading"}
      error={message.error?.message || message.status == "error"}
    >
      <div className="relative">
        {generated.map((path) => (
          <div className="flex items-center" key={"gen" + path}>
            <CheckIcon className="w-4 h-4 mx-1" />
            <span className="whitespace-pre-wrap">{path}</span>
          </div>
        ))}
        {typeof generating === "string" && (
          <div className="flex">
            <Spinner className="mr-1" loading={message.status !== "error"}>
              {message.status === "error" ? (
                <XIcon className="w-4 h-4 text-red-700" />
              ) : (
                <CheckIcon className="w-4 h-4" />
              )}
            </Spinner>
            <span>{generating}</span>
          </div>
        )}
      </div>
    </DataPartComponent>
  );
}
