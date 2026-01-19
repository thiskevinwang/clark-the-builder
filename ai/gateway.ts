import { anthropic, type AnthropicProviderOptions } from "@ai-sdk/anthropic";
import { openai, type OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import type { JSONValue } from "ai";

import { MODEL_LABELS, Models, type ModelId } from "./constants";

export async function getAvailableModels() {
  // We don't call an external "models" endpoint; we publish the supported list
  // from our local registry.
  return (Object.values(Models) as ModelId[]).map((id) => ({
    id,
    name: MODEL_LABELS[id] ?? id,
  }));
}

export interface ModelOptions {
  model: LanguageModelV3;
  providerOptions?: Record<string, Record<string, JSONValue>>;
  headers?: Record<string, string>;
}

export function getModelOptions(
  modelId: ModelId,
  options?: {
    // gpt-5.2:  'none', 'low', 'medium', 'high', and 'xhigh'
    reasoningEffort?: "none" | "low" | "medium" | "high" | "xhigh";
  },
): ModelOptions {
  let v3Model;
  switch (modelId) {
    case Models.AnthropicClaudeOpus45:
      v3Model = anthropic(modelId);
      break;
    case Models.OpenAIGpt52:
      v3Model = openai(modelId);
      break;
    default:
      throw new Error(`Unsupported model id: ${modelId}`);
  }

  return {
    model: v3Model,
    headers: { "anthropic-beta": "fine-grained-tool-streaming-2025-05-14" },
    providerOptions: {
      anthropic: {
        thinking: {
          type: "enabled",
        },
        sendReasoning: true,
        cacheControl: { type: "ephemeral" },
      } satisfies AnthropicProviderOptions /* https://ai-sdk.dev/providers/ai-sdk-providers/anthropic */,
      openai: {
        ...options,
      } satisfies OpenAIResponsesProviderOptions /* https://ai-sdk.dev/providers/ai-sdk-providers/openai */,
    },
  };
}
