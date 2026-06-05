export type ModelProvider = "openai" | "anthropic" | "google";

export type ModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-3-5-sonnet-20241022"
  | "claude-haiku-3-5"
  | "gemini-2.0-flash"
  | "gemini-2.0-flash-lite";

export interface ModelConfig {
  id: ModelId;
  label: string;
  provider: ModelProvider;
  apiUrl: string;
}

export interface Tone {
  id: string;
  name: string;
  slug: string;
  /** Injected into the system prompt between [TONE]...[/TONE] markers — not the full prompt */
  instructions: string;
}

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
}

export interface ActiveConfig {
  configured: true;
  url: string;
  key: string;
  model: ModelId;
  provider: ModelProvider;
  systemPrompt: string;
}

export interface UnconfiguredConfig {
  configured: false;
  reason: "no_api_key" | "no_tone" | "no_model";
}

export type NativeConfig = ActiveConfig | UnconfiguredConfig;
