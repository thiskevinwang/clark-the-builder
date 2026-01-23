import { Streamdown } from "streamdown";

import type { DataPart } from "@/ai/messages/data-parts";

import { DataPartComponent } from "../data-part";

interface Props {
  message: DataPart["report-errors"];
}
export function ReportErrors({ message }: Props) {
  return (
    <DataPartComponent title="Errors">
      <div className="relative min-h-5">
        <Streamdown className="**:text-xs">{message.summary}</Streamdown>
      </div>
    </DataPartComponent>
  );
}
