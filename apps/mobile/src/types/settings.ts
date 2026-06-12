export type { ModelProvider, Tone } from "@refine/schemas"

export interface ModelConfig {
  id: string
  label: string
  provider: string
  apiUrl: string
}

export interface ServerConfig {
  configured: true
  serverUrl: string
  sessionToken: string
  modelId: string
  toneSlug: string
}

export interface UnconfiguredConfig {
  configured: false
  reason: "no_server" | "no_tone" | "no_model"
}

export type NativeConfig = ServerConfig | UnconfiguredConfig
