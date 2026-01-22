import type { DataPart } from "@/ai/messages/data-parts";

import { DataPartMessage } from "../data-part-message";

interface Props {
  message: DataPart["create-sandbox"];
}

export function CreateSandbox({ message }: Props) {
  return (
    <DataPartMessage
      title="Create Sandbox"
      loading={message.status == "loading"}
      error={message.error?.message || message.status == "error"}
    >
      <div className="relative">
        <span>
          {message.status === "done" && "Sandbox created successfully"}
          {message.status === "loading" && "Creating Sandbox"}
          {message.status === "error" && "Failed to create sandbox"}
        </span>
      </div>

      <small className="text-muted-foreground">{message.sandboxId}</small>
    </DataPartMessage>
  );
}
