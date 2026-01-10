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
} as const;

export type ModelId = (typeof Models)[keyof typeof Models];

/**
 * Back-compat for previously stored/linked gateway-style ids.
 */
export const LEGACY_MODEL_ID_MAP: Record<string, ModelId> = {
  "anthropic/claude-opus-4.5": Models.AnthropicClaudeOpus45,
  "anthropic/claude-opus-4": Models.AnthropicClaudeOpus45,
};

export const MODEL_LABELS: Record<ModelId, string> = {
  [Models.AnthropicClaudeOpus45]: "Claude Opus 4.5",
};

export const DEFAULT_MODEL: ModelId = Models.AnthropicClaudeOpus45;

export const SUPPORTED_MODELS: ModelId[] = [DEFAULT_MODEL];
