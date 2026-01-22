import { Streamdown } from "streamdown";

import type { DataPart } from "@/ai/messages/data-parts";

import { DataPartMessage } from "../data-part-message";

export function RunCommand({ message }: { message: DataPart["run-command"] }) {
  return (
    <DataPartMessage
      title="Run Cmd"
      loading={["executing", "waiting"].includes(message.status)}
      error={message.error?.message || message.status === "error"}
    >
      <Streamdown>{`\`${message.command} ${message.args.join(" ")}\``}</Streamdown>
    </DataPartMessage>
  );
}
