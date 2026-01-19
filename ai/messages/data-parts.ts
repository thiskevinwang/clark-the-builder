import z from "zod/v3";

export const errorSchema = z.object({
  message: z.string(),
});

// Update this schema when adding a new DataPart.
export const dataPartSchema = z.object({
  "create-sandbox": z.object({
    sandboxId: z.string().optional(),
    status: z.enum(["loading", "done", "error"]),
    error: errorSchema.optional(),
  }),
  "create-clerk-app": z.object({
    name: z.string(),
    applicationId: z.string().optional(),
    publishableKey: z.string().optional(),
    secretKey: z.string().optional(),
    status: z.enum(["loading", "done", "error"]),
    error: errorSchema.optional(),
  }),
  "generating-files": z.object({
    paths: z.array(z.string()),
    status: z.enum(["generating", "uploading", "uploaded", "done", "error"]),
    error: errorSchema.optional(),
  }),
  "run-command": z.object({
    sandboxId: z.string(),
    commandId: z.string().optional(),
    command: z.string(),
    args: z.array(z.string()),
    status: z.enum(["executing", "running", "waiting", "done", "error"]),
    exitCode: z.number().optional(),
    error: errorSchema.optional(),
  }),
  "get-sandbox-url": z.object({
    url: z.string().optional(),
    status: z.enum(["loading", "done"]),
  }),
  "report-errors": z.object({
    summary: z.string(),
    paths: z.array(z.string()).optional(),
  }),
  wait: z.object({
    status: z.enum(["waiting", "completed"]),
    time_ms: z.number().optional(),
  }),
});

export type DataPart = z.infer<typeof dataPartSchema>;
