import type { DataPart } from "@/ai/messages/data-parts";

import { DataPartComponent } from "../data-part";

interface Props {
  message: DataPart["create-sandbox"];
}

export function CreateSandbox({ message }: Props) {
  const hasError = message.status === "error" || Boolean(message.error?.message);

  return (
    <DataPartComponent
      title="Create Sandbox"
      loading={message.status === "loading"}
      error={hasError}
    >
      <div className="relative">
        <span>
          {message.status === "done" && "Sandbox created successfully"}
          {message.status === "loading" && "Creating Sandbox"}
          {message.status === "error" && "Failed to create sandbox"}
        </span>
      </div>

      <small className="text-muted-foreground">{message.sandboxId}</small>
    </DataPartComponent>
  );
}
