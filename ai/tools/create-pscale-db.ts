import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import z from "zod";

import { createClient, createConfig } from "../../lib/pscale/client";
import { createDatabase } from "../../lib/pscale/sdk.gen";
import type { DataPart } from "../messages/data-parts";
import description from "./create-pscale-db.prompt.md";
import { getRichError } from "./get-rich-error";

interface Params {
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
}

const pscaleClient = createClient(
  createConfig({
    baseUrl: "https://api.planetscale.com/v1",
    headers: {
      Authorization: `${process.env.PLANETSCALE_SERVICE_TOKEN_ID}:${process.env.PLANETSCALE_SERVICE_TOKEN}`,
    },
  }),
);

export const createPscaleDb = ({ writer }: Params) =>
  tool({
    description,
    inputSchema: z.object({
      name: z
        .string()
        .describe(
          "The name for the database. Should be lowercase, alphanumeric, and may include hyphens.",
        ),
      organization: z
        .string()
        .describe("The PlanetScale organization name where the database will be created."),
      clusterSize: z
        .string()
        .default("PS_10")
        .describe(
          "The database cluster size name (e.g., 'PS_10', 'PS_80'). Use 'PS_10' for development/small workloads.",
        ),
      region: z
        .string()
        .optional()
        .describe(
          "The region where the database will be deployed. Defaults to the organization's default region if not specified.",
        ),
      replicas: z
        .number()
        .min(0)
        .optional()
        .describe("The number of replicas for the database. 0 for non-HA (default), 2+ for HA."),
    }),
    execute: async ({ name, organization, clusterSize, region, replicas }, { toolCallId }) => {
      writer.write({
        id: toolCallId,
        type: "data-create-pscale-db",
        data: { status: "loading", name },
      });

      try {
        const response = await createDatabase({
          client: pscaleClient,
          path: {
            organization,
          },
          body: {
            name,
            cluster_size: clusterSize,
            kind: "postgresql",
            ...(region && { region }),
            ...(replicas !== undefined && { replicas }),
          },
        });

        if (response.error) {
          throw new Error(`PlanetScale API error: ${JSON.stringify(response.error)}`);
        }

        const database = response.data;

        writer.write({
          id: toolCallId,
          type: "data-create-pscale-db",
          data: {
            status: "done",
            name,
            databaseId: database?.id,
            url: database?.url,
          },
        });

        return (
          `Database "${name}" created successfully in organization "${organization}".` +
          `\nDatabase ID: ${database?.id}` +
          `\nYou can now create branches, passwords, and connect to the database.`
        );
      } catch (error) {
        const richError = getRichError({
          action: "Creating PlanetScale Database",
          args: { name, organization, clusterSize, region, replicas },
          error,
        });

        writer.write({
          id: toolCallId,
          type: "data-create-pscale-db",
          data: {
            error: { message: richError.error.message },
            status: "error",
            name,
          },
        });

        console.log("Error creating PlanetScale Database:", richError.error);
        return richError.message;
      }
    },
  });
