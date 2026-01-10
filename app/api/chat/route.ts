import { anthropic } from "@ai-sdk/anthropic";
import {
  ToolLoopAgent,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  type ModelMessage,
} from "ai";
import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";

import { DEFAULT_MODEL } from "@/ai/constants";
import { getAvailableModels, getModelOptions } from "@/ai/gateway";
import { getMCPClient } from "@/ai/mcp-client";
import { tools } from "@/ai/tools";

import { type ChatUIMessage } from "@/components/chat/types";
import { type MCPConnector } from "@/components/connectors/use-mcp-connectors";

import prompt from "./prompt.md";

const systemMessage: ModelMessage = {
  role: "system",
  content: prompt,
};

interface BodyData {
  messages: ChatUIMessage[];
  modelId?: string;
  reasoningEffort?: "low" | "medium";
  connectors?: MCPConnector[];
}

export async function POST(req: Request) {
  const checkResult = await checkBotId();
  if (checkResult.isBot) {
    return NextResponse.json({ error: `Bot detected` }, { status: 403 });
  }

  const [models, reqBody] = await Promise.all([
    getAvailableModels(),
    req.json() as Promise<BodyData>,
  ]);

  const { messages, modelId = DEFAULT_MODEL, reasoningEffort, connectors } = reqBody;

  const model = models.find((model) => model.id === modelId);
  if (!model) {
    return NextResponse.json({ error: `Model ${modelId} not found.` }, { status: 400 });
  }

  // dynamic list of MCP clients
  const clients = await Promise.all(
    connectors
      ?.filter((connector) => connector.enabled)
      .map(async (connector) => {
        return await getMCPClient(connector.url);
      }) || [],
  );

  const dynamicTools = clients.reduce((acc, client) => {
    return {
      ...acc,
      ...client.tools,
    };
  }, {});

  function closeMCPClients() {
    return Promise.all(clients?.map((client) => client.close()) || []);
  }

  const modelOptions = getModelOptions(modelId, { reasoningEffort });

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      originalMessages: messages,
      execute: async ({ writer }) => {
        const agent = new ToolLoopAgent({
          model: modelOptions.model,
          headers: modelOptions.headers,
          providerOptions: modelOptions.providerOptions,
          stopWhen: stepCountIs(20),
          onFinish: async () => {
            await closeMCPClients();
          },
          tools: {
            code_execution: anthropic.tools.codeExecution_20250825(),
            ...tools({ modelId, writer }),
            ...dynamicTools,
          },
        });

        const result = await agent.stream({
          messages: [systemMessage].concat(
            await convertToModelMessages(
              messages.map((message) => {
                message.parts = message.parts.map((part) => {
                  if (part.type === "data-report-errors") {
                    return {
                      type: "text",
                      text:
                        `There are errors in the generated code. This is the summary of the errors we have:\n` +
                        `\`\`\`${part.data.summary}\`\`\`\n` +
                        (part.data.paths?.length
                          ? `The following files may contain errors:\n` +
                            `\`\`\`${part.data.paths?.join("\n")}\`\`\`\n`
                          : "") +
                        `Fix the errors reported.`,
                    };
                  }
                  return part;
                });
                return message;
              }),
            ),
          ),
        });

        writer.merge(
          result.toUIMessageStream({
            sendReasoning: true,
            sendStart: false,
            messageMetadata: () => ({
              model: model.name,
            }),
          }),
        );
      },
    }),
  });
}
