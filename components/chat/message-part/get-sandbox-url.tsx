import type { DataPart } from "@/ai/messages/data-parts";

import { DataPartMessage } from "../data-part-message";

export function GetSandboxURL({ message }: { message: DataPart["get-sandbox-url"] }) {
  return (
    <DataPartMessage title="Get Sandbox URL" loading={message.status == "loading"}>
      <div className="relative">
        <a
          href={message.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-xs underline font-medium"
        >
          {message.url}
        </a>
      </div>
    </DataPartMessage>
  );
}
