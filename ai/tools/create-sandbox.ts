import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import z from "zod";

import { db } from "@/lib/database/db";
import { createResourceRepository } from "@/lib/repositories/resource-repository-impl";

import { sandboxProvider } from "../../lib/sandbox";
import type { DataPart } from "../messages/data-parts";
import description from "./create-sandbox.prompt.md";
import { getRichError } from "./get-rich-error";

interface Params {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
  conversationId: string;
}

export const createSandbox = ({ writer, conversationId }: Params) =>
  tool({
    description,
    inputSchema: z.object({
      timeout: z
        .number()
        .min(600000)
        .max(2700000)
        .optional()
        .describe(
          "Maximum time in milliseconds the Vercel Sandbox will remain active before automatically shutting down. Minimum 600000ms (10 minutes), maximum 2700000ms (45 minutes). Defaults to 600000ms (10 minutes). The sandbox will terminate all running processes when this timeout is reached.",
        ),
      ports: z
        .array(z.number())
        .max(2)
        .optional()
        .describe(
          "Array of network ports to expose and make accessible from outside the Vercel Sandbox. These ports allow web servers, APIs, or other services running inside the Vercel Sandbox to be reached externally. Common ports include 3000 (Next.js), 8000 (Python servers), 5000 (Flask), etc.",
        ),
      env: z
        .record(z.string())
        .optional()
        .describe(
          "Environment variables to set in the sandbox. Use this to pass secrets and configuration like NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY for Clerk authentication, or any other environment variables the application needs.",
        ),
    }),
    execute: async ({ timeout, ports, env }, { toolCallId }) => {
      writer.write({
        id: toolCallId,
        type: "data-create-sandbox",
        data: { status: "loading" },
      });

      try {
        const sandbox = await sandboxProvider.create({
          // TODO(kevin): Support creation from a git repository
          // source: {
          //   url: "https://github.com/clerk/nextjs-auth-starter-template.git",
          //   type: "git",
          // },
          // FUTURE(kevin): Can we require auth & fetch VERCEL_OIDC_TOKEN for the application visitor?
          // token: ...,
          timeout: timeout ?? 1000 * 60 * 20, // 20 minutes
          ports,
        });

        writer.write({
          id: toolCallId,
          type: "data-create-sandbox",
          data: { sandboxId: sandbox.sandboxId, status: "done" },
        });

        // Save the Vercel sandbox as a resource
        const resourceRepository = createResourceRepository(db);
        await resourceRepository.create({
          type: "vercel_sandbox",
          externalId: sandbox.sandboxId,
          conversationId,
          metadata: {
            timeout: timeout ?? 1000 * 60 * 20,
            ports,
          },
        });

        return (
          `Sandbox created with ID: ${sandbox.sandboxId}.` +
          `\nYou can now upload files, run commands, and access services on the exposed ports.`
        );
      } catch (error) {
        const richError = getRichError({
          action: "Creating Sandbox",
          error,
        });

        writer.write({
          id: toolCallId,
          type: "data-create-sandbox",
          data: {
            error: { message: richError.error.message },
            status: "error",
          },
        });

        console.log("Error creating Sandbox:", richError.error);
        return richError.message;
      }
    },
  });
