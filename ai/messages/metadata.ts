import z from "zod/v3";

export const metadataSchema = z.object({
  model: z.string().optional(),
  totalTokens: z.number().optional(),
  createdAt: z.number().optional(),
});

export type Metadata = z.infer<typeof metadataSchema>;
