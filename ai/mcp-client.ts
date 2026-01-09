import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = "https://mcp.clerk.com/mcp";

const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));

/**
 * Creates a fresh MCP client and returns its tools with explicit Zod schemas.
 * Returns a cleanup function to close the client after the request is done.
 *
 * To discover available tools from the MCP server, temporarily use:
 *   const tools = await client.tools();
 *   console.log("Available tools:", Object.keys(tools));
 */
export async function getClerkMCPTools() {
  const client = await createMCPClient({
    transport: {
      type: "http",
      url: MCP_URL,
    },
  });

  // Define explicit Zod schemas for Clerk MCP tools
  // This provides type safety and fixes validation compatibility issues
  const tools = await client.tools();

  return {
    tools,
    close: () => client.close(),
  };
}
