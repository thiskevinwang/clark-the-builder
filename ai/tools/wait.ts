import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import z from "zod";

import { DataPart } from "../messages/data-parts";

interface Params {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
}

export const waitTool = ({ writer }: Params) => {
  return tool({
    description: "Waits for a specified amount of time in milliseconds.",
    inputSchema: z.object({
      time_ms: z
        .number()
        .describe("The amount of time to wait in milliseconds.")
        .max(30000, "Cannot wait more than 30 seconds.")
        .default(1000)
        .optional(),
    }),
    outputSchema: z.object({
      status: z.enum(["completed"]),
      time_ms: z.number().optional(),
    }),
    execute: async ({ time_ms }, { toolCallId }) => {
      writer.write({
        id: toolCallId,
        type: "data-wait",
        data: { status: "waiting", time_ms },
      });

      await new Promise((resolve) => setTimeout(resolve, time_ms));

      writer.write({
        id: toolCallId,
        type: "data-wait",
        data: { status: "completed", time_ms },
      });

      return { status: "completed", time_ms };
    },
  });
};
