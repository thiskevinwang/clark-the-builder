import { useReasoningEffort } from "./use-settings";

export function ReasoningEffort() {
  // Reasoning effort is an OpenAI-only feature; this project uses Anthropic.
  // Keep the control hidden to avoid confusing users.
  const [effort, setEffort] = useReasoningEffort();
  return null;

  void effort;
  void setEffort;
}
