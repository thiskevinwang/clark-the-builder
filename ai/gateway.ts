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
}

export function getModelOptions(
  modelId: ModelId,
  options?: {
    // gpt-5.5: 'none', 'low', 'medium', 'high', and 'xhigh'
    reasoningEffort?: "none" | "low" | "medium" | "high" | "xhigh";
  },
): ModelOptions {
  return {
    model: openai(modelId),
    providerOptions: {
      openai: {
        reasoningSummary: "auto",
        ...options,
      } satisfies OpenAIResponsesProviderOptions,
    },
  };
}
