export type ModelProvider = "openrouter" | "openai" | "anthropic" | "google"

export interface Model {
  id: string
  label: string
  free?: boolean
  icon?: string
}

export interface Provider {
  id: ModelProvider
  label: string
  description: string
  placeholder: string
  docs: string
  icon: string
  models: Model[]
  create: (apiKey: string) => (modelId: string) => unknown
}
