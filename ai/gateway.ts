import { anthropic } from "@ai-sdk/anthropic";
import {
  LEGACY_MODEL_ID_MAP,
  MODEL_LABELS,
  Models,
  type ModelId,
} from "./constants";
import type { JSONValue } from "ai";
import type { LanguageModelV2 } from "@ai-sdk/provider";

export async function getAvailableModels() {
  // We don't call an external "models" endpoint; we publish the supported list
  // from our local registry.
  return (Object.values(Models) as ModelId[]).map((id) => ({
    id,
    name: MODEL_LABELS[id] ?? id,
  }));
}

export interface ModelOptions {
  model: LanguageModelV2;
  providerOptions?: Record<string, Record<string, JSONValue>>;
  headers?: Record<string, string>;
}

export function getModelOptions(
  modelId: string,
  options?: { reasoningEffort?: "minimal" | "low" | "medium" }
): ModelOptions {
  // Ignore reasoning effort (OpenAI-only) but keep the signature stable.
  void options;

  const normalizedId = normalizeModelId(modelId);

  // Anthropic-specific options used for better tool streaming/caching.
  return {
    model: anthropic(normalizedId),
    headers: { "anthropic-beta": "fine-grained-tool-streaming-2025-05-14" },
    providerOptions: {
      anthropic: {
        cacheControl: { type: "ephemeral" },
      },
    },
  };
}

function normalizeModelId(modelId: string): ModelId {
  if ((Object.values(Models) as string[]).includes(modelId)) {
    return modelId as ModelId;
  }

  const legacy = LEGACY_MODEL_ID_MAP[modelId];
  if (legacy) return legacy;

  // Fall back to default model for unknown ids.
  return Models.AnthropicClaudeOpus45;
}
