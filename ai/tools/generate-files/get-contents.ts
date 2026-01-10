import { Output, streamText, type ModelMessage } from "ai";
import z from "zod";

import { ModelId } from "@/ai/constants";
import { getModelOptions } from "@/ai/gateway";

import { Deferred } from "@/lib/deferred";

export type File = z.infer<typeof fileSchema>;

const fileSchema = z.object({
  path: z
    .string()
    .describe(
      "Path to the file in the Vercel Sandbox (relative paths from sandbox root, e.g., 'src/main.js', 'package.json', 'components/Button.tsx')",
    ),
  content: z
    .string()
    .describe(
      "The content of the file as a utf8 string (complete file contents that will replace any existing file at this path)",
    ),
});

interface Params {
  messages: ModelMessage[];
  modelId: ModelId;
  paths: string[];
}

interface FileContentChunk {
  files: z.infer<typeof fileSchema>[];
  paths: string[];
  written: string[];
}

export async function* getContents(params: Params): AsyncGenerator<FileContentChunk> {
  const generated: z.infer<typeof fileSchema>[] = [];
  const deferred = new Deferred<void>();
  const result = streamText({
    // gpt-5.2:  'none', 'low', 'medium', 'high', and 'xhigh'
    ...getModelOptions(params.modelId, { reasoningEffort: "low" }),
    maxOutputTokens: 64000,
    system:
      "You are a file content generator. You must generate files based on the conversation history and the provided paths. NEVER generate lock files (pnpm-lock.yaml, package-lock.json, yarn.lock) - these are automatically created by package managers.",
    messages: [
      ...params.messages,
      {
        role: "user",
        content: `Generate the content of the following files according to the conversation: ${params.paths.map(
          (path) => `\n - ${path}`,
        )}`,
      },
    ],
    output: Output.object({ schema: z.object({ files: z.array(fileSchema) }) }),
    onError: (error) => {
      console.error("Error communicating with AI");
      console.error(JSON.stringify(error, null, 2));
      deferred.reject(error);
    },
  });

  for await (const items of result.partialOutputStream) {
    if (!Array.isArray(items?.files)) {
      continue;
    }

    const written = generated.map((file) => file.path);
    // Skip the trailing in-flight entries so we don't emit incomplete files.
    const paths = written.concat(
      items.files
        .slice(generated.length, items.files.length - 1)
        .flatMap((f) => (f?.path ? [f.path] : [])),
    );

    // Parse only the settled files beyond what we've already yielded.
    const files = items.files
      .slice(generated.length, items.files.length - 2)
      .map((file) => fileSchema.parse(file));

    if (files.length > 0) {
      yield { files, paths, written };
      generated.push(...files);
    } else {
      yield { files: [], written, paths };
    }
  }

  // Wait for either completion or an error; then flush the remaining files.
  const raceResult = await Promise.race([result.output, deferred.promise]);
  if (!raceResult) {
    throw new Error("Unexpected Error: Deferred was resolved before the result");
  }

  const written = generated.map((file) => file.path);
  const files = raceResult.files.slice(generated.length);
  const paths = written.concat(files.map((file) => file.path));
  if (files.length > 0) {
    yield { files, written, paths };
    generated.push(...files);
  }
}
