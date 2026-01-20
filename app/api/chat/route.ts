import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  stepCountIs,
  streamText,
  type ModelMessage,
} from "ai";
import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";

import { DEFAULT_MODEL, ModelId } from "@/ai/constants";
import { getAvailableModels, getModelOptions } from "@/ai/gateway";
import { getMCPClient } from "@/ai/mcp-client";
import { tools } from "@/ai/tools";

import { type ChatUIMessage } from "@/components/chat/types";
import { db } from "@/lib/database/db";
import { genMessageId } from "@/lib/identifiers/generator";
import { createMCPConnectionRepository } from "@/lib/repositories/mcp-connection-repository-impl";
import { createMessageRepository } from "@/lib/repositories/message-repository-impl";

import prompt from "./prompt.md";

const systemMessage: ModelMessage = {
  role: "system",
  content: prompt,
};

export interface ChatRequestBody {
  chatId: string;
  messages: ChatUIMessage[];
  modelId?: ModelId;
  reasoningEffort?: "none" | "low" | "medium" | "high" | "xhigh";
}

function coerceMetadata(value: unknown): Record<string, unknown> | undefined {
  if (!value) return undefined;
  if (typeof value !== "object") return undefined;
  if (Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

export async function POST(req: Request) {
  const checkResult = await checkBotId();
  if (checkResult.isBot) {
    return NextResponse.json({ error: `Bot detected` }, { status: 403 });
  }

  const [models, { messages, chatId, modelId = DEFAULT_MODEL, reasoningEffort }] =
    await Promise.all([getAvailableModels(), req.json() as Promise<ChatRequestBody>]);

  const messageRepo = createMessageRepository(db);
  const mcpConnectionRepo = createMCPConnectionRepository(db);
  const connectors = await mcpConnectionRepo.listRecent(10, 0, undefined);

  // Load persisted UI messages from the messages table.
  // const persistedRows = await messageRepo.listByConversationId(chatId);

  const validationResult = await safeValidateUIMessages({
    // messages: [...persistedRows, message],
    messages,
  });
  if (!validationResult.success) {
    console.error("Corrupted message history:", validationResult.error);
    return NextResponse.json({ error: "Corrupted message history" }, { status: 500 });
  }
  const allMessages = validationResult.data;

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

  // This is the main streaming response
  const stream = createUIMessageStream({
    generateId: genMessageId,
    originalMessages: allMessages,
    execute: async ({ writer }) => {
      // This is the actual model request + response
      const result = streamText({
        ...getModelOptions(modelId, { reasoningEffort }),
        system: systemMessage.content as string,
        messages: await convertToModelMessages(allMessages), // todo: handle errored data-parts
        stopWhen: stepCountIs(20),
        tools: {
          ...tools({ modelId, writer, chatId }),
          ...dynamicTools,
        },
        onError: async (error) => {
          console.error("Error during agent execution:", error);
          await closeMCPClients();
        },
        onFinish: async ({ usage, reasoningText, totalUsage }) => {
          console.log("Generation finished");
          console.log("Usage:", JSON.stringify(usage, null, 2));
          console.log("Total Usage:", JSON.stringify(totalUsage, null, 2));
          console.log("Reasoning Text:", reasoningText);
        },
      });

      result.consumeStream();

      writer.merge(
        result.toUIMessageStream({
          originalMessages: allMessages,
          sendReasoning: true,
          sendSources: true,
          generateMessageId: genMessageId,
          sendStart: true,
          messageMetadata: () => ({
            model: model.name,
          }),
          onFinish: async ({ messages }) => {
            // Persist the updated list of messages including tool calls and final response

            for (const msg of messages) {
              await messageRepo.upsertByExternalId({
                id: msg.id,
                conversationId: chatId,
                role: msg.role,
                parts: msg.parts,
                metadata: coerceMetadata(msg.metadata),
                externalId: msg.id,
              });
            }

            await closeMCPClients();
          },
        }),
      );
    },
  });

  // https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data#streaming-custom-data
  // createUIMessageStreamResponse: creates a response object that streams data
  return createUIMessageStreamResponse({ stream });
}
