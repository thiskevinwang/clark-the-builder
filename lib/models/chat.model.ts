import z from "zod";

const chatModel = z.object({
  id: z.string(),
  userId: z.string().or(z.null()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ChatModel = z.infer<typeof chatModel>;
