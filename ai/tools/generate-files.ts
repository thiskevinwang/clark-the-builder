import type { UIMessage, UIMessageStreamWriter } from "ai";
import { tool } from "ai";
import z from "zod";

import type { ModelId } from "@/ai/constants";

import { sandboxProvider, type Sandbox } from "../../lib/sandbox";
import type { DataPart } from "../messages/data-parts";
import description from "./generate-files.prompt.md";
import { getContents, type File } from "./generate-files/get-contents";
import { getWriteFiles } from "./generate-files/get-write-files";
import { getRichError } from "./get-rich-error";

const fileSchema = z.object({
  path: z.string().describe("Path to the file in the sandbox (e.g., '.env', 'config.json')"),
  content: z.string().describe("The content of the file"),
});

interface Params {
  modelId: ModelId;
  writer: UIMessageStreamWriter<UIMessage<never, DataPart>>;
}

export const generateFiles = ({ writer, modelId }: Params) =>
  tool({
    description,
    inputSchema: z.object({
      sandboxId: z.string(),
      paths: z.array(z.string()),
      files: z
        .array(fileSchema)
        .optional()
        .describe(
          "Array of files with predefined content to upload directly without AI generation. Use this for files like .env that contain secrets from previous tool calls (e.g., Clerk keys from createClerkApp). These files are uploaded first, before the AI-generated files.",
        ),
    }),
    execute: async ({ sandboxId, paths, files: predefinedFiles }, { toolCallId, messages }) => {
      writer.write({
        id: toolCallId,
        type: "data-generating-files",
        data: { paths: [], status: "generating" },
      });

      let sandbox: Sandbox | null = null;

      try {
        sandbox = await sandboxProvider.get({ sandboxId });
      } catch (error) {
        const richError = getRichError({
          action: "get sandbox by id",
          args: { sandboxId },
          error,
        });

        writer.write({
          id: toolCallId,
          type: "data-generating-files",
          data: { error: richError.error, paths: [], status: "error" },
        });

        return richError.message;
      }

      const writeFiles = getWriteFiles({ sandbox, toolCallId, writer });
      const uploaded: File[] = [];

      // Upload predefined files first (e.g., .env with Clerk keys)
      if (predefinedFiles && predefinedFiles.length > 0) {
        try {
          const error = await writeFiles({
            written: [],
            files: predefinedFiles,
            paths: predefinedFiles.map((f) => f.path),
          });
          if (error) {
            return error;
          }
          uploaded.push(...predefinedFiles);
        } catch (error) {
          const richError = getRichError({
            action: "write predefined files to sandbox",
            args: { predefinedFiles },
            error,
          });

          writer.write({
            id: toolCallId,
            type: "data-generating-files",
            data: {
              error: richError.error,
              status: "error",
              paths: predefinedFiles.map((f) => f.path),
            },
          });

          return richError.message;
        }
      }

      const iterator = getContents({ messages, modelId, paths });

      const predefinedPaths = predefinedFiles?.map((f) => f.path) ?? [];

      try {
        for await (const chunk of iterator) {
          if (chunk.files.length > 0) {
            const error = await writeFiles({
              ...chunk,
              written: predefinedPaths.concat(chunk.written),
              paths: predefinedPaths.concat(chunk.paths),
            });
            if (error) {
              return error;
            } else {
              uploaded.push(...chunk.files);
            }
          } else {
            writer.write({
              id: toolCallId,
              type: "data-generating-files",
              data: {
                status: "generating",
                paths: predefinedPaths.concat(chunk.paths),
              },
            });
          }
        }
      } catch (error) {
        const richError = getRichError({
          action: "generate file contents",
          args: { modelId, paths },
          error,
        });

        writer.write({
          id: toolCallId,
          type: "data-generating-files",
          data: {
            error: richError.error,
            status: "error",
            paths,
          },
        });

        return richError.message;
      }

      writer.write({
        id: toolCallId,
        type: "data-generating-files",
        data: { paths: uploaded.map((file) => file.path), status: "done" },
      });

      return `Successfully generated and uploaded ${
        uploaded.length
      } files. Their paths and contents are as follows:
        ${uploaded.map((file) => `Path: ${file.path}\nContent: ${file.content}\n`).join("\n")}`;
    },
  });
