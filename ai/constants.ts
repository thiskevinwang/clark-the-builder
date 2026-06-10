import { type anthropic } from "@ai-sdk/anthropic";
import { type openai } from "@ai-sdk/openai";

export type AnthropicModels = Parameters<typeof anthropic>[0];
export type OpenAIModels = Parameters<typeof openai>[0];

/**
 * Central model registry.
 *
 * We intentionally do NOT use the AI Gateway in this repo; we call Anthropic
 * directly via `@ai-sdk/anthropic`.
 */
export const Models = {
  OpenAIGPT55: "gpt-5.5",
} satisfies Record<string, AnthropicModels | OpenAIModels>;

export type ModelId = (typeof Models)[keyof typeof Models];

export const MODEL_LABELS: Record<ModelId, string> = {
  [Models.OpenAIGPT55]: "GPT-5.5",
};

export const DEFAULT_MODEL: ModelId = Models.OpenAIGPT55;

export const SUPPORTED_MODELS: ModelId[] = Object.values(Models);
