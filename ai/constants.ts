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
  /**
   * Claude Opus 4.5 (Anthropic API model id)
   *
   * NOTE: This is the Anthropic model identifier (not the old "provider/id"
   * gateway format).
   */
  AnthropicClaudeOpus45: "claude-opus-4-5-20251101",
  AnthropicClaudeOpus46: "claude-opus-4-6",
  OpenAIGpt52: "gpt-5.2",
  OpenAIGpt53Codex: "gpt-5.3-codex",
  OpenAIGPT54: "gpt-5.4",
  OpenAIGPT54Mini: "gpt-5.4-mini",
} satisfies Record<string, AnthropicModels | OpenAIModels>;

export type ModelId = (typeof Models)[keyof typeof Models];

export const MODEL_LABELS: Record<ModelId, string> = {
  [Models.AnthropicClaudeOpus45]: "Claude Opus 4.5",
  [Models.AnthropicClaudeOpus46]: "Claude Opus 4.6",
  [Models.OpenAIGpt52]: "GPT-5.2",
  [Models.OpenAIGpt53Codex]: "GPT-5.3 Codex",
  [Models.OpenAIGPT54]: "GPT-5.4",
  [Models.OpenAIGPT54Mini]: "GPT-5.4 Mini",
};

export const DEFAULT_MODEL: ModelId = Models.OpenAIGPT54;

export const SUPPORTED_MODELS: ModelId[] = Object.values(Models);
