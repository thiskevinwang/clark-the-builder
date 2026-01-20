import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import z from "zod";

import { platformCreateApplication } from "@/lib/api";
import { createClient, createConfig } from "@/lib/api/client";

import type { DataPart } from "../messages/data-parts";
import description from "./create-clerk-app.prompt.md";
import { getRichError } from "./get-rich-error";

interface Params {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
}

export const createClerkApp = ({ writer }: Params) =>
  tool({
    description,
    inputSchema: z.object({
      name: z
        .string()
        .describe(
          "The name for the Clerk application. This should be descriptive of the project being built.",
        ),
      template: z
        .enum(["b2b-saas", "waitlist"])
        .optional()
        .describe("The template to use for the Clerk application."),
    }),

    execute: async ({ name, template }, { toolCallId }) => {
      console.log(
        "[tools/create-clerk-app] Creating Clerk app with name:",
        name,
        "and template:",
        template,
      );

      writer.write({
        id: toolCallId,
        type: "data-create-clerk-app",
        data: { status: "loading", name },
      });

      const clerkPlatformToken = process.env.CLERK_PLATFORM_ACCESS_TOKEN;

      if (!clerkPlatformToken) {
        const errorMessage = "CLERK_PLATFORM_ACCESS_TOKEN environment variable is not set";
        writer.write({
          id: toolCallId,
          type: "data-create-clerk-app",
          data: {
            status: "error",
            name,
            error: { message: errorMessage },
          },
        });
        throw new Error(`Error creating Clerk app: ${errorMessage}`);
      }

      try {
        const client = createClient(
          createConfig({
            baseUrl: "https://api.clerk.com/v1",
            headers: {
              Authorization: `Bearer ${clerkPlatformToken}`,
            },
          }),
        );

        const response = await platformCreateApplication({
          client,
          body: {
            name,
            environment_types: ["development"],
            template,
          },
        });

        if (response.error) {
          const errorMessage =
            response.error.errors?.[0]?.message ?? "Unknown error creating Clerk app";
          writer.write({
            id: toolCallId,
            type: "data-create-clerk-app",
            data: {
              status: "error",
              name,
              error: { message: errorMessage },
            },
          });
          throw new Error(`Error creating Clerk app: ${errorMessage}`);
        }

        const application = response.data;
        const devInstance = application.instances.find((i) => i.environment_type === "development");

        if (!devInstance) {
          const errorMessage = "No development instance found in created application";
          writer.write({
            id: toolCallId,
            type: "data-create-clerk-app",
            data: {
              status: "error",
              name,
              error: { message: errorMessage },
            },
          });
          throw new Error(`Error creating Clerk app: ${errorMessage}`);
        }

        writer.write({
          id: toolCallId,
          type: "data-create-clerk-app",
          data: {
            status: "done",
            name,
            applicationId: application.application_id,
            publishableKey: devInstance.publishable_key,
            secretKey: devInstance.secret_key,
          },
        });

        return (
          `Clerk application "${name}" created successfully.\n` +
          `Application ID: ${application.application_id}\n` +
          `Publishable Key: ${devInstance.publishable_key}\n` +
          `Secret Key: ${devInstance.secret_key}\n\n` +
          `Use these environment variables when creating the sandbox:\n` +
          `- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${devInstance.publishable_key}\n` +
          `- CLERK_SECRET_KEY=${devInstance.secret_key}`
        );
      } catch (error) {
        const richError = getRichError({
          action: "Creating Clerk App",
          error,
        });

        writer.write({
          id: toolCallId,
          type: "data-create-clerk-app",
          data: {
            status: "error",
            name,
            error: { message: richError.error.message },
          },
        });

        console.log("Error creating Clerk app:", richError.error);
        throw new Error(richError.message);
      }
    },
  });
