import { createIdGenerator } from "ai";

export const genMessageId = createIdGenerator({
  prefix: "msg",
  separator: "_",
  size: 24,
});

export const genConversationId = createIdGenerator({
  prefix: "conv",
  separator: "_",
  size: 24,
});
