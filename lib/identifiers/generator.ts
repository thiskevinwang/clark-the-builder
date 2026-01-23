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

export const genMcpConnectionId = createIdGenerator({
  prefix: "mcp",
  separator: "_",
  size: 24,
});

export const genResourceId = createIdGenerator({
  prefix: "res",
  separator: "_",
  size: 24,
});
