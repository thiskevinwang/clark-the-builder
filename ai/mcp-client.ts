import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";

export async function getMCPClient(url: string) {
  const client = await createMCPClient({
    transport: {
      type: "http",
      url: url,
    },
  });

  const tools = await client.tools();

  return {
    tools,
    close: () => client.close(),
  };
}
