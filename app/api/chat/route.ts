// /api/chat is the default route that the useChat hook uses
import { anthropic, type AnthropicProviderOptions } from "@ai-sdk/anthropic";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai";
import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";

import { DEFAULT_MODEL } from "@/ai/constants";
import { getAvailableModels, getModelOptions } from "@/ai/gateway";
import { getClerkMCPTools } from "@/ai/mcp-client";
import { tools } from "@/ai/tools";

import { type ChatUIMessage } from "@/components/chat/types";

import prompt from "./prompt.md";

interface BodyData {
  messages: ChatUIMessage[];
  modelId?: string;
  reasoningEffort?: "low" | "medium";
}

export async function POST(req: Request) {
  const checkResult = await checkBotId();
  if (checkResult.isBot) {
    return NextResponse.json({ error: `Bot detected` }, { status: 403 });
  }

  const [
    models,
    { messages, modelId = DEFAULT_MODEL, reasoningEffort },
    { tools: mcpTools, close: closeMCPClient },
  ] = await Promise.all([
    getAvailableModels(),
    req.json() as Promise<BodyData>,
    getClerkMCPTools(),
  ]);

  const model = models.find((model) => model.id === modelId);
  if (!model) {
    return NextResponse.json({ error: `Model ${modelId} not found.` }, { status: 400 });
  }

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      originalMessages: messages,
      execute: ({ writer }) => {
        const result = streamText({
          ...getModelOptions(modelId, { reasoningEffort }),
          system: prompt,
          providerOptions: {
            anthropic: {
              // container: {
              //   skills: [
              //     {
              //       skillId: "kevin-skill",
              //       type: "custom",
              //       version: "1.0.0",
              //     },
              //   ],
              // },
            } satisfies AnthropicProviderOptions,
          },
          messages: convertToModelMessages(
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
          onStepFinish: (step) => {
            console.log(JSON.stringify(step, null, 2));
          },
          stopWhen: stepCountIs(20),
          tools: {
            code_execution: anthropic.tools.codeExecution_20250825(),
            ...tools({ modelId, writer }),
            ...mcpTools,
          },
          onError: async (error) => {
            console.error("Error communicating with AI");
            console.error(JSON.stringify(error, null, 2));
            await closeMCPClient();
          },
          onFinish: async () => {
            await closeMCPClient();
          },
        });

        result.consumeStream();

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
