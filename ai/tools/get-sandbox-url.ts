import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import z from "zod";

import { sandboxProvider } from "../../lib/sandbox";
import type { DataPart } from "../messages/data-parts";
import description from "./get-sandbox-url.md";

interface Params {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
}

export const getSandboxURL = ({ writer }: Params) =>
  tool({
    description,
    inputSchema: z.object({
      sandboxId: z
        .string()
        .describe(
          "The Vercel Sandbox reference/name returned when creating or resuming a sandbox.",
        ),
      port: z
        .number()
        .describe(
          "The port number where a service is running inside the Vercel Sandbox (e.g., 3000 for Next.js dev server, 8000 for Python apps, 5000 for Flask). The port must have been exposed when the sandbox was created or when running commands.",
        ),
    }),
    execute: async ({ sandboxId, port }, { toolCallId }) => {
      writer.write({
        id: toolCallId,
        type: "data-get-sandbox-url",
        data: { status: "loading" },
      });

      const sandbox = await sandboxProvider.get({ sandboxId });
      const url = sandbox.domain(port);

      writer.write({
        id: toolCallId,
        type: "data-get-sandbox-url",
        data: { url, status: "done" },
      });

      return { url };
    },
  });
