import z from "zod";

const messageModel = z.object({
  id: z.string(),
  chatId: z.string(),
  content: z.string(),
  role: z.enum(["user", "assistant"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MessageModel = z.infer<typeof messageModel>;
