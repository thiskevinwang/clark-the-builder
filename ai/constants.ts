import { type openai } from "@ai-sdk/openai";

export type OpenAIModels = Parameters<typeof openai>[0];

/**
 * Central model registry.
 */
export const Models = {
  OpenAIGPT56LUNA: "gpt-5.6-luna",
} satisfies Record<string, OpenAIModels>;

export type ModelId = (typeof Models)[keyof typeof Models];

export const MODEL_LABELS: Record<ModelId, string> = {
  [Models.OpenAIGPT56LUNA]: "GPT-5.6 Luna",
};

export const DEFAULT_MODEL: ModelId = Models.OpenAIGPT56LUNA;

export const SUPPORTED_MODELS: ModelId[] = Object.values(Models);
