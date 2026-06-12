export type ModelProvider = "openai" | "anthropic" | "google"

export interface ModelConfig {
  id: string
  label: string
  provider: ModelProvider
}

export const MODELS: ModelConfig[] = [
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "openai" },
  { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "anthropic" },
  { id: "claude-haiku-3-5", label: "Claude Haiku 3.5", provider: "anthropic" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "google" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", provider: "google" },
]

export const PROVIDERS: ModelProvider[] = ["openai", "anthropic", "google"]

export const PROVIDER_LABELS: Record<ModelProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
}
