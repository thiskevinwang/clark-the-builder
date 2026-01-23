import { Streamdown } from "streamdown";

import type { DataPart } from "@/ai/messages/data-parts";

import { DataPartComponent } from "../data-part";

export function RunCommand({ message }: { message: DataPart["run-command"] }) {
  return (
    <DataPartComponent
      title="Run Cmd"
      loading={["executing", "waiting"].includes(message.status)}
      error={message.error?.message || message.status === "error"}
    >
      <Streamdown>{`\`${message.command} ${message.args.join(" ")}\``}</Streamdown>
    </DataPartComponent>
  );
}
