export type ModelProvider = "openrouter" | "openai" | "anthropic" | "google"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

export type ProviderOptions = Record<string, Record<string, JsonValue>>

export interface Model {
  id: string
  label: string
  free?: boolean
  icon?: string
  cost?: { input: number; output: number }
  options?: ProviderOptions
}

export interface Provider {
  id: ModelProvider
  label: string
  description: string
  placeholder: string
  docs: string
  icon: string
  models: Model[]
  options?: ProviderOptions
  create: (apiKey: string) => (modelId: string) => unknown
}
